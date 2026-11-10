from datetime import datetime, timezone
import copy
from typing import Dict, Any, List, Optional
from app.models import (
    SharedSituationModel, AlertLifecycle, MissionApprovalState,
    MissionType, Mission, IncidentStatus, MutualAidState,
    AuditEvent, RouteStatus, DroneStatus, RiskLevel, HazardTrend,
    PredictionInput
)
from app.engine.scoring import score_scene, access_at
from app.engine.allocation import plan, tasks_from_incidents
from app.engine.recon import propose as propose_recon

class OrchestrationEngine:
    def __init__(self, state: SharedSituationModel):
        self.state = state
        self._generate_rescue_missions()

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _scores(self):
        return score_scene(self.state.zones, self.state.routes, self.state.recent_inputs)

    def _zone(self, zone_id: str):
        return next((z for z in self.state.zones if z.id == zone_id), None)

    def add_audit(self, source: str, action: str, details: str, confidence: Optional[int] = 95, user: str = "LOCAL_AUTHORITY"):
        now_str = self._now()
        event = AuditEvent(
            id=f"AUD-{len(self.state.audit_log) + 1:03d}",
            timestamp=now_str,
            source_module=source,
            action=action,
            details=details,
            confidence_pct=confidence,
            user_id=user
        )
        self.state.audit_log.insert(0, event)
        self.state.last_updated = now_str

    def confirm_disaster(self, user_id: str = "Shri R. Baruah, IAS", notes: str = "Confirmed on multi-sensor corroboration."):
        now_str = datetime.now(timezone.utc).isoformat()
        self.state.alert.lifecycle = AlertLifecycle.CONFIRMED
        self.state.alert.authority_decision = {
            "decision": "CONFIRMED",
            "decided_by": user_id,
            "timestamp": now_str,
            "notes": notes
        }
        self.state.incident_phase = "ACTIVE_RESPONSE_MOBILIZATION"
        self.add_audit("AUTHORITY", "DISASTER_CONFIRMED", f"Local Authority confirmed Level 3 Flood Emergency. E-RESQ and E-SUPP operational directives activated. {notes}", 100, user_id)
        
        # Recalculate and generate E-RESQ mission
        self._generate_rescue_missions()
        return self.state

    def reject_or_monitor(self, user_id: str, action: str = "MONITORING", notes: str = "Continuous monitoring requested."):
        now_str = datetime.now(timezone.utc).isoformat()
        self.state.alert.lifecycle = AlertLifecycle.MONITORING
        self.state.alert.authority_decision = {
            "decision": action,
            "decided_by": user_id,
            "timestamp": now_str,
            "notes": notes
        }
        self.add_audit("AUTHORITY", f"ALERT_{action}", f"Authority selected {action}: {notes}", 90, user_id)
        return self.state

    def escalate_to_district(self, user_id: str = "SYSTEM_TIMEOUT"):
        now_str = datetime.now(timezone.utc).isoformat()
        self.state.alert.lifecycle = AlertLifecycle.ESCALATED
        self.state.alert.escalated_to = "District Disaster Management Authority (DDMA) Commissioner"
        self.add_audit("ORCHESTRATOR", "ESCALATION_TRIGGERED", "Local 5-minute review window elapsed without sign-off while risk remains severe (88%). Escalated to District Authority.", 95, user_id)
        return self.state

    def dispatch_reconnaissance(self, zone_id: str = "ZONE_F",
                                drone_id: str = "DRN-SC-01"):
        """
        Dispatch is authorised only if the zone is either
          (a) an active engine proposal, or
          (b) already covered by an approved/pending recon mission.
        """
        scores = self._scores()
        proposals = propose_recon(scores, self.state.drones, self.state.missions,
                                  self.state.recent_inputs)["proposals"]
        by_zone = {p["zone_id"]: p for p in proposals}

        existing = next((m for m in self.state.missions
                         if m.type == MissionType.RECONNAISSANCE
                         and m.target_zone_id == zone_id
                         and m.approval_state in (
                             MissionApprovalState.PROPOSED,
                             MissionApprovalState.AWAITING_APPROVAL,
                             MissionApprovalState.APPROVED)), None)

        if zone_id not in by_zone and existing is None:
            raise ValueError(f"No active recon proposal for {zone_id}")

        drone = next((d for d in self.state.drones if d.id == drone_id), None)
        if not drone:
            raise ValueError(f"Drone {drone_id} not found")
        if drone.status == DroneStatus.MISSION_ACTIVE:
            self.add_audit(
                "ORCHESTRATOR", "CONFLICT_PREVENTED",
                f"Conflict check blocked dispatch: {drone.callsign} already assigned "
                f"to an active flight.", 100, "SAFETY_GATE",
            )
            return self.state

        proposal = by_zone.get(zone_id)
        mission = existing
        if mission is None:
            mission = Mission(
                id=f"MSN-REC-{len([m for m in self.state.missions if m.type == MissionType.RECONNAISSANCE]) + 1:02d}",
                title=f"E-SCOUT Reconnaissance: resolve information gap at {zone_id}",
                type=MissionType.RECONNAISSANCE,
                priority="URGENT" if proposal["info_value"] >= 55 else "HIGH",
                target_zone_id=zone_id,
                target_coords=list(self._zone(zone_id).center),
                assigned_resources=[drone_id],
                approval_state=MissionApprovalState.AWAITING_APPROVAL,
                explanation={
                    "evidence": "; ".join(proposal["reasons"]),
                    "rule": proposal["rule"],
                    "info_value": proposal["info_value"],
                    "need": proposal["need"],
                    "confidence_pct": proposal["confidence_pct"],
                    "expected_confidence_gain_pct": proposal["expected_confidence_gain_pct"],
                    "approval_required": True,
                },
                created_at=self._now(),
                status_notes="Proposed by uncertainty rule; dispatch supervised.",
            )
            self.state.missions.append(mission)
        else:
            mission.approval_state = MissionApprovalState.ACTIVE

        drone.status = DroneStatus.MISSION_ACTIVE
        drone.current_mission_id = mission.id
        drone.last_telemetry_time = self._now()

        self.add_audit(
            "E-SWARM", "RECON_DISPATCHED",
            f"{drone.callsign} launched to {zone_id}. "
            + (f"Rule: {proposal['rule']}. " if proposal else "Pre-existing authorised mission. ")
            + "Optical and FLIR telemetry streaming.", 98, "E_SWARM_CONTROLLER",
        )

        self._apply_recon_effect(zone_id)
        return self.state

    def _apply_recon_effect(self, zone_id: str):
        """
        The flight returns evidence. It does NOT declare a road blocked — that is
        an operator decision. Confidence and freshness change; status does not.
        """
        zone = self._zone(zone_id)
        if zone is None:
            return self.state

        now_str = self._now()
        samples = [
            ("DRONE_TELEMETRY", "water_level", "Direct water depth sounding at 1.4 m", 97),
            ("DRONE_TELEMETRY", "inundation_extent", "4K optical extent polygon captured", 95),
            ("DRONE_TELEMETRY", "route_access", "Approach corridor visually inspected", 93),
        ]
        for source, metric, reading, conf in samples:
            self.state.recent_inputs.insert(0, PredictionInput(
                id=f"INP-{len(self.state.recent_inputs) + 1:03d}",
                zone_id=zone_id,
                source_type=source,
                source_id="E-SCOUT-01-4K-OPTICAL",
                timestamp=now_str,
                freshness_min=1,
                confidence_pct=conf,
                metric_name=metric,
                reading_value=reading,
                status="VERIFIED",
                location_desc=f"{zone_id} aerial observation",
            ))

        ra = access_at(zone.center, self.state.routes)
        if ra.get("route_id"):
            for r in self.state.routes:
                if r.id == ra["route_id"]:
                    r.freshness_min = 1
                    r.confidence_pct = max(r.confidence_pct, 99)
                    r.source = r.source if "E-SCOUT" in r.source else f"{r.source} + E-SCOUT-01"
                    break

        self.add_audit(
            "E-SWARM", "RECON_TELEMETRY_RECEIVED",
            f"3 verified observations received for {zone_id}; freshness reset to 1 min. "
            f"Route status unchanged — verification of closure remains an operator decision.",
            97, "E_SWARM_CONTROLLER",
        )
        return self.state

    def _generate_rescue_missions(self):
        """
        Allocation-driven tasking. Replaces the previous hardcoded assignment of
        RES-SDRF-BOAT-03 / RES-NDRF-01.
        """
        scores = self._scores()
        tasks = tasks_from_incidents(self.state.incidents, scores)
        if not tasks:
            return self.state

        result = plan(tasks, self.state.resources, scores, self.state.routes)

        for assignment in result["assignments"]:
            mission_id = f"MSN-{assignment['task_id']}"
            planned = [r["resource_id"] for r in assignment["resources"]]
            existing = next((m for m in self.state.missions if m.id == mission_id), None)

            if existing is not None:
                # Re-plan unapproved missions when the computed plan differs.
                # Approved/active missions are frozen: a human already signed.
                if existing.approval_state in (MissionApprovalState.PROPOSED,
                                               MissionApprovalState.AWAITING_APPROVAL) \
                        and planned and set(planned) != set(existing.assigned_resources):
                    previous = list(existing.assigned_resources)
                    existing.assigned_resources = planned
                    existing.explanation.update({
                        "evidence": assignment["reason"],
                        "eta_min": assignment["worst_case_eta_min"],
                        "coverage": assignment["coverage"],
                        "needs_verification": assignment["needs_verification"],
                        "replanned": True,
                    })
                    existing.status_notes = (
                        f"Re-planned by allocation engine: ETA "
                        f"{assignment['worst_case_eta_min']} min, coverage "
                        f"{int(assignment['coverage'] * 100)}%. Awaiting Local Authority."
                    )
                    self.add_audit(
                        "ORCHESTRATOR", "REPLAN_APPLIED",
                        f"{mission_id} reassigned {previous} -> {planned}. "
                        f"Reason: {assignment['reason']}", 90, "ORCHESTRATION_ENGINE",
                    )
                continue

            zone = self._zone(assignment["zone_id"])
            zscore = scores.get(assignment["zone_id"])
            inc = next((i for i in self.state.incidents
                        if i.id == assignment["task_id"]), None)
            need = zscore.need if zscore else 0.0
            priority = "URGENT" if need >= 75 else "HIGH" if need >= 55 else "MEDIUM"

            self.state.missions.append(Mission(
                id=mission_id,
                title=f"E-RESQ Dispatch: {getattr(inc, 'title', assignment['task_id'])}",
                type=MissionType.RESCUE_DISPATCH,
                priority=priority,
                target_zone_id=assignment["zone_id"],
                target_coords=list(getattr(inc, "coords", [26.17, 91.75])),
                assigned_resources=[r["resource_id"] for r in assignment["resources"]],
                approval_state=MissionApprovalState.AWAITING_APPROVAL,
                explanation={
                    "evidence": assignment["reason"],
                    "confidence_pct": zscore.confidence_pct if zscore else 50,
                    "urgency": priority,
                    "approval_required": True,
                    "need": need,
                    "access": zscore.access if zscore else None,
                    "eta_min": assignment["worst_case_eta_min"],
                    "coverage": assignment["coverage"],
                    "required_persons": assignment["required_persons"],
                    "covered_persons": assignment["covered_persons"],
                    "needs_verification": assignment["needs_verification"],
                    "score_inputs": (zscore.components if zscore else {}),
                    "alternatives_considered": next(
                        (d.get("candidates_considered", []) for d in result["decision_log"]
                         if d["task_id"] == assignment["task_id"]), []),
                },
                created_at=self._now(),
                status_notes=(
                    f"Computed by allocation engine: ETA {assignment['worst_case_eta_min']} min, "
                    f"coverage {int(assignment['coverage'] * 100)}%. Awaiting Local Authority."
                ),
            ))

            if assignment["needs_verification"]:
                self.add_audit(
                    "ORCHESTRATOR", "VERIFICATION_RECOMMENDED",
                    f"{mission_id} targets {assignment['zone_id']} with "
                    f"{zscore.confidence_pct if zscore else 50}% confidence. "
                    f"Recommend aerial verification before dispatch.", 80,
                    "ORCHESTRATION_ENGINE",
                )

        for gap in result["unassigned"]:
            self.add_audit(
                "ORCHESTRATOR", "NO_RESOURCE_AVAILABLE",
                f"{gap['task_id']} ({gap['zone_id']}) could not be tasked: {gap['reason']}",
                60, "ORCHESTRATION_ENGINE",
            )

        # Check if cargo mission exists
        if not any(m.id == "MSN-CARGO-01" for m in self.state.missions):
            now_str = self._now()
            cargo_mission = Mission(
                id="MSN-CARGO-01",
                title="E-CARGO Emergency Air-Drop: Trauma Packs & ORS to Chandrapur Rooftop",
                type=MissionType.CARGO_DELIVERY,
                priority="HIGH",
                target_zone_id="ZONE_F",
                target_coords=[26.179, 91.824],
                assigned_resources=["DRN-CG-01"],
                approval_state=MissionApprovalState.AWAITING_APPROVAL,
                explanation={
                    "evidence": "Isolated stranded group has no fresh water or medical aid. E-CARGO drone can deliver 8.5kg trauma & water kit in 14 minutes prior to boat arrival.",
                    "confidence_pct": 96,
                    "urgency": "HIGH",
                    "approval_required": True,
                    "payload_description": "8.5 kg Emergency Trauma Kits, ORS, Water Purification Tablets"
                },
                created_at=now_str,
                status_notes="DRN-CG-01 payload secured at Station Alpha. Awaiting authorization."
            )
            self.state.missions.append(cargo_mission)

        return self.state

    def approve_mission(self, mission_id: str, user_id: str = "Shri R. Baruah, IAS"):
        for m in self.state.missions:
            if m.id == mission_id:
                m.approval_state = MissionApprovalState.APPROVED
                m.status_notes = f"Authorized by {user_id}. Field units en route."
                
                # Update assigned resources status
                for res_id in m.assigned_resources:
                    for r in self.state.resources:
                        if r.id == res_id:
                            r.status = "DEPLOYED"
                            r.assigned_mission_id = m.id
                    for d in self.state.drones:
                        if d.id == res_id:
                            d.status = DroneStatus.MISSION_ACTIVE
                            d.current_mission_id = m.id

                self.add_audit("E-RESQ" if "RES" in m.id else "E-SUPP", "MISSION_APPROVED", f"Mission {m.id} ({m.title}) authorized for execution.", 100, user_id)
                return self.state
        raise ValueError(f"Mission {mission_id} not found")

    def execute_cargo_drop(self, mission_id: str = "MSN-CARGO-01"):
        now_str = datetime.now(timezone.utc).isoformat()
        for m in self.state.missions:
            if m.id == mission_id:
                m.approval_state = MissionApprovalState.COMPLETED
                m.status_notes = "Payload delivered safely via precision winch drop. DRN-CG-01 returning to base."
        
        # Replenish isolated shelter / target
        for sh in self.state.shelters:
            if sh.id == "SH-04":
                sh.medical_need = "Stabilized - Emergency trauma kit & ORS delivered by E-CARGO-01"
                sh.water_liters += 400
        
        # Drone returns
        for d in self.state.drones:
            if d.id == "DRN-CG-01":
                d.status = DroneStatus.RETURNING
                d.battery_pct -= 18
                d.current_payload_kg = 0.0

        self.add_audit("E-SWARM", "CARGO_DELIVERY_SUCCESS", "E-CARGO-01 executed precision air-drop of 8.5kg trauma & hydration supplies to Chandrapur school rooftop. Target confirmed receipt.", 99, "E_CARGO_CONTROLLER")
        return self.state

    def approve_mutual_aid(self, request_id: str = "REQ-MA-001", user_id: str = "Shri R. Baruah, IAS"):
        now_str = datetime.now(timezone.utc).isoformat()
        for req in self.state.mutual_aid_requests:
            if req.id == request_id:
                req.state = MutualAidState.APPROVED_TRANSMITTED
                req.approved_by = user_id
                req.approved_at = now_str
                req.fulfillment_notes = "Transmitted to Tezpur Logistics Depot via National Disaster Logistics Gateway. Inter-district convoy dispatch estimated at 45 minutes."
                self.add_audit("E-SUPP", "MUTUAL_AID_APPROVED", f"Mutual Aid Request {req.id} ({req.quantity} {req.item_requested}) approved and dispatched to {req.recommended_source}.", 100, user_id)
                return self.state
        raise ValueError(f"Request {request_id} not found")

