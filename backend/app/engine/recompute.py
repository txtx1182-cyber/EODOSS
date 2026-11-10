"""
One recompute pass over the whole situation, plus a diff against the previous
pass so the audit trail can say *what changed and why* — not just "state updated".
"""
from typing import Any, Dict, List, Sequence

from . import config as C
from .allocation import plan, tasks_from_incidents
from .recon import propose
from .scoring import score_scene


def derive(situation) -> Dict[str, Any]:
    """Pure: reads the situation, mutates nothing, returns derived state."""
    zones = score_scene(situation.zones, situation.routes, situation.recent_inputs)
    tasks = tasks_from_incidents(situation.incidents, zones)
    allocation = plan(tasks, situation.resources, zones, situation.routes)
    recon = propose(zones, situation.drones, situation.missions, situation.recent_inputs)

    return {
        "version": C.DERIVED_VERSION,
        "zones": {zid: s.to_dict() for zid, s in zones.items()},
        "allocation": allocation,
        "recon": recon,
        "counts": {
            "zones": len(zones),
            "tasks": len(tasks),
            "assigned": len(allocation["assignments"]),
            "unassigned": len(allocation["unassigned"]),
            "recon_proposals": len(recon["proposals"]),
        },
    }


def diff(previous: Dict[str, Any], current: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Field-level change list between two derived snapshots."""
    changes: List[Dict[str, Any]] = []
    if not previous:
        return changes

    prev_zones = previous.get("zones", {})
    for zid, now in current.get("zones", {}).items():
        before = prev_zones.get(zid)
        if not before:
            changes.append({"entity": "zone", "id": zid, "field": "created",
                            "old": None, "new": now.get("need")})
            continue
        for field in ("need", "confidence_pct", "info_value", "action", "need_rank"):
            if before.get(field) != now.get(field):
                changes.append({
                    "entity": "zone", "id": zid, "field": field,
                    "old": before.get(field), "new": now.get(field),
                })
        if before.get("evidence", {}).get("route", {}).get("access") != \
                now.get("evidence", {}).get("route", {}).get("access"):
            changes.append({
                "entity": "zone", "id": zid, "field": "access",
                "old": before["evidence"]["route"].get("access"),
                "new": now["evidence"]["route"].get("access"),
            })

    prev_assign = {
        a["task_id"]: tuple(r["resource_id"] for r in a["resources"])
        for a in previous.get("allocation", {}).get("assignments", [])
    }
    for a in current.get("allocation", {}).get("assignments", []):
        now_res = tuple(r["resource_id"] for r in a["resources"])
        if prev_assign.get(a["task_id"]) != now_res:
            changes.append({
                "entity": "task", "id": a["task_id"], "field": "assignment",
                "old": prev_assign.get(a["task_id"]), "new": now_res,
            })

    prev_recon = {p["zone_id"] for p in previous.get("recon", {}).get("proposals", [])}
    for p in current.get("recon", {}).get("proposals", []):
        if p["zone_id"] not in prev_recon:
            changes.append({
                "entity": "recon", "id": p["zone_id"], "field": "proposed",
                "old": None, "new": p["info_value"],
            })
    return changes


def audit_events(changes: Sequence[Dict[str, Any]], limit: int = 12) -> List[Dict[str, Any]]:
    """Turn changes into AuditEvent-shaped dicts (caller assigns ids/time)."""
    out = []
    for c in changes[:limit]:
        if c["entity"] == "zone":
            detail = f"{c['id']} {c['field']}: {c['old']} -> {c['new']}"
            if c["field"] in ("need", "access"):
                action = "PRIORITY_RECALCULATED"
            elif c["field"] == "action":
                action = "RECOMMENDATION_CHANGED"
            else:
                action = "EVIDENCE_UPDATED"
        elif c["entity"] == "task":
            detail = f"{c['id']} reassigned {c['old']} -> {c['new']}"
            action = "REPLAN_APPLIED"
        else:
            detail = f"recon proposed for {c['id']} (info_value {c['new']})"
            action = "RECON_PROPOSED"
        out.append({
            "source_module": "ORCHESTRATOR",
            "action": action,
            "details": detail,
            "confidence_pct": None,
            "user_id": "ORCHESTRATION_ENGINE",
        })
    return out
