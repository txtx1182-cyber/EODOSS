"""
Resource allocation: task -> resource, with capability, capacity, ETA and
route-access constraints, and a hard guard against double-booking.

This replaces the hardcoded `assigned_resources=["RES-SDRF-BOAT-03", ...]`
in orchestration.py. Every assignment returns its own score breakdown, so the
operator can see *why* this boat and not the other one.
"""
from typing import Any, Dict, List, Optional, Sequence

from . import config as C
from .geo import haversine_km
from .scoring import access_at

TASK_TYPE_CAPABILITY = C.CAPABILITY


def _s(value: Any) -> str:
    return getattr(value, "value", value)


def travel_minutes(resource, target_coords, access: float, station_access: float = 1.0) -> Dict[str, float]:
    """
    Straight-line ETA with two independent penalties:
      - degraded route into the target zone
      - a depot that is itself cut off (boat behind a washed-out road)
    """
    dist = haversine_km(resource.current_coords, target_coords)
    speed = C.RESOURCE_SPEED_KMH.get(_s(resource.kind), C.DEFAULT_SPEED_KMH)
    base = (dist / max(1.0, speed)) * 60.0
    route_penalty = 1.0 + C.ROUTE_PENALTY_MULTIPLIER * (1.0 - access)
    depot_penalty = 1.0 + 1.0 * (1.0 - station_access)
    detour = C.CUTOFF_DETOUR_MIN if station_access < C.CUTOFF_ACCESS_THRESHOLD else 0.0
    return {
        "distance_km": round(dist, 2),
        "base_min": round(base, 1),
        "eta_min": round(base * route_penalty * depot_penalty + detour, 1),
        "access_factor": round(access, 3),
        "station_access": round(station_access, 3),
        "detour_min": detour,
    }


def plan(tasks: Sequence[Dict[str, Any]], resources: Sequence, zones: Dict[str, Any],
         routes: Sequence) -> Dict[str, Any]:
    """
    tasks: [{"id", "type", "zone_id", "coords", "required_persons", "confidence_pct"}]
    zones: {zone_id: ZoneScore} from scoring.score_scene
    Returns assignments, unassigned, and a per-decision score table.
    """
    busy: set = set()
    assignments: List[Dict[str, Any]] = []
    unassigned: List[Dict[str, Any]] = []
    decision_log: List[Dict[str, Any]] = []

    station_access = {
        getattr(r, "id", "?"): access_at(getattr(r, "current_coords", [0, 0]), routes)["access"]
        for r in resources
    }

    ordered = sorted(
        tasks,
        key=lambda t: (
            -(zones.get(t["zone_id"]).need if zones.get(t["zone_id"]) else 0.0),
            -float(t.get("confidence_pct", 50) or 50),
        ),
    )

    for task in ordered:
        zid = task["zone_id"]
        zscore = zones.get(zid)
        need = zscore.need if zscore else 30.0
        access = zscore.access if zscore else 0.4
        allowed = TASK_TYPE_CAPABILITY.get(_s(task.get("type")), ())
        required = int(task.get("required_persons", 1) or 1)

        candidates = []
        for r in resources:
            if _s(getattr(r, "status", "")).upper() != "AVAILABLE":
                continue
            if getattr(r, "id", None) in busy:
                continue
            if allowed and _s(getattr(r, "kind", "")) not in allowed:
                continue
            t = travel_minutes(r, task["coords"], access, station_access.get(getattr(r, "id", "?"), 0.5))
            utility = need / (1.0 + t["eta_min"] / 45.0)
            candidates.append({
                "resource_id": getattr(r, "id", "?"),
                "kind": _s(getattr(r, "kind", "")),
                "capacity": int(getattr(r, "capacity_persons", 0) or 0),
                "eta_min": t["eta_min"],
                "distance_km": t["distance_km"],
                "station_access": t["station_access"],
                "utility": round(utility, 2),
            })

        candidates.sort(key=lambda c: -c["utility"])
        decision_log.append({
            "task_id": task["id"],
            "zone_id": zid,
            "need": need,
            "access": access,
            "candidates_considered": candidates[:5],
        })

        if not candidates:
            unassigned.append({
                "task_id": task["id"], "zone_id": zid,
                "reason": f"no AVAILABLE resource with capability {allowed or 'ANY'}",
            })
            continue

        chosen, covered = [], 0
        for cand in candidates:
            if len(chosen) >= C.MAX_RESOURCES_PER_TASK:
                break
            if covered >= required and chosen:
                break
            chosen.append(cand)
            busy.add(cand["resource_id"])
            covered += max(1, cand["capacity"])

        worst_eta = max(c["eta_min"] for c in chosen)
        assignments.append({
            "task_id": task["id"],
            "zone_id": zid,
            "type": _s(task.get("type")),
            "resources": chosen,
            "covered_persons": covered,
            "required_persons": required,
            "coverage": round(min(1.0, covered / max(1, required)), 2),
            "worst_case_eta_min": worst_eta,
            "needs_verification": float(task.get("confidence_pct", 100) or 100) < C.VERIFY_FIRST_CONFIDENCE * 100,
            "reason": (
                f"{chosen[0]['kind']} {chosen[0]['resource_id']} "
                f"({chosen[0]['distance_km']} km, ETA {chosen[0]['eta_min']} min, "
                f"access {access:.2f}, need {need})"
            ),
        })

    return {
        "assignments": assignments,
        "unassigned": unassigned,
        "decision_log": decision_log,
        "resources_used": len(busy),
    }


def tasks_from_incidents(incidents: Sequence, zones: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Adapter: rescue incidents -> allocation tasks."""
    tasks = []
    for inc in incidents:
        status = _s(getattr(inc, "status", "")).upper()
        if status in ("RESCUED", "CANCELLED"):
            continue
        tasks.append({
            "id": getattr(inc, "id", "?"),
            "type": "RESCUE_DISPATCH",
            "zone_id": getattr(inc, "zone_id", ""),
            "coords": getattr(inc, "coords", [0, 0]),
            "required_persons": int(getattr(inc, "estimated_count", 1) or 1),
            "confidence_pct": float(getattr(inc, "confidence_pct", 50) or 50),
        })
    return tasks
