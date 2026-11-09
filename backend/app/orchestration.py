from datetime import datetime, timezone
import copy
from typing import Dict, Any, List, Optional
from app.models import (
    SharedSituationModel, AlertLifecycle, MissionApprovalState,
    MissionType, Mission, IncidentStatus, MutualAidState,
    AuditEvent, RouteStatus, DroneStatus, RiskLevel, HazardTrend
)

class OrchestrationEngine:
    def __init__(self, state: SharedSituationModel):
        self.state = state

    def add_audit(self, source: str, action: str, details: str, confidence: Optional[int] = 95, user: str = "LOCAL_AUTHORITY"):
        now_str = datetime.now(timezone.utc).isoformat()
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

    def dispatch_reconnaissance(self, drone_id: str = "DRN-SC-01", target_zone: str = "ZONE_F"):
        now_str = datetime.now(timezone.utc).isoformat()
        drone = next((d for d in self.state.drones if d.id == drone_id), None)
        if not drone:
            raise ValueError(f"Drone {drone_id} not found")
        
        # Conflict check
        if drone.status == DroneStatus.MISSION_ACTIVE:
            self.add_audit("ORCHESTRATOR", "CONFLICT_PREVENTED", f"Conflict check blocked dispatch: {drone.callsign} already assigned to an active flight.", 100, "SAFETY_GATE")
            return self.state

        drone.status = DroneStatus.MISSION_ACTIVE
        drone.current_mission_id = "MSN-REC-01"
        
        # Update mission state
        for m in self.state.missions:
            if m.id == "MSN-REC-01":
                m.approval_state = MissionApprovalState.ACTIVE
                m.status_notes = f"In flight over {target_zone}. Telemetry live via 5.8GHz tactical mesh."
        
        self.add_audit("E-SWARM", "RECON_DISPATCHED", f"{drone.callsign} launched from Station Alpha to {target_zone}. Optical and FLIR telemetry streaming.", 98, "E_SWARM_CONTROLLER")
        
        # Simulate drone discovery updating shared state
        self._simulate_drone_recon_findings()
        return self.state

    def _simulate_drone_recon_findings(self):
        # 1. Update Route RT-03 with high confidence drone verification
        for r in self.state.routes:
            if r.id == "RT-03":
                r.status = RouteStatus.BLOCKED
                r.access_score = 5
                r.source = "E-SCOUT-01 High-Res 4K Optical Feed"
                r.freshness_min = 1
                r.confidence_pct = 99
                r.notes = "VERIFIED BLOCKED: 15-meter embankment breach with torrential flow. Wheeled access completely cut off."
        
        # 2. Update Incident INC-01
        for inc in self.state.incidents:
            if inc.id == "INC-01":
                inc.status = IncidentStatus.VERIFIED_TARGET
                inc.confidence_pct = 98
                inc.verified_by = "E-SCOUT-01 Computer Vision + Operator Sign-off"
        
        self.add_audit("ORCHESTRATOR", "REPLANNING_TRIGGERED", "New drone telemetry received: Route RT-03 verified BLOCKED. Incident INC-01 upgraded to VERIFIED_TARGET. Recalculating E-RESQ boat routes and E-CARGO airdrop priorities.", 98, "ORCHESTRATION_ENGINE")
        self._generate_rescue_missions()

    def _generate_rescue_missions(self):
        # Check if rescue mission already exists
        if not any(m.id == "MSN-RES-01" for m in self.state.missions):
            now_str = datetime.now(timezone.utc).isoformat()
            rescue_mission = Mission(
                id="MSN-RES-01",
                title="E-RESQ Amphibious Rescue: 14 Stranded Villagers at Chandrapur School",
                type=MissionType.RESCUE_DISPATCH,
                priority="URGENT",
                target_zone_id="ZONE_F",
                target_coords=[26.179, 91.824],
                assigned_resources=["RES-SDRF-BOAT-03", "RES-NDRF-01"],
                approval_state=MissionApprovalState.AWAITING_APPROVAL,
                explanation={
                    "evidence": "E-SCOUT-01 confirmed 14 persons on rooftop with rising flood level. Route RT-03 road washed out; water approach via Brahmaputra riverway recommended.",
                    "confidence_pct": 98,
                    "urgency": "CRITICAL",
                    "approval_required": True,
                    "recommended_shelter": "SH-01 Jalukbari Higher Secondary Relief Shelter"
                },
                created_at=now_str,
                status_notes="Awaiting Local Authority mission authorization. Boat trailers staging at Pandu Slipway."
            )
            self.state.missions.append(rescue_mission)

        # Check if cargo mission exists
        if not any(m.id == "MSN-CARGO-01" for m in self.state.missions):
            now_str = datetime.now(timezone.utc).isoformat()
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

