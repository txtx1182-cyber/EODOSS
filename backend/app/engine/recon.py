"""
Reconnaissance rule.

The drone is not dispatched by a button. It is proposed when the *unknown*
sits where the *stakes* are:

    info_value = need x (1 - confidence)

This is the smallest honest implementation of "task the sensor where the answer
changes the decision".
"""
from typing import Any, Dict, List, Sequence

from . import config as C
from .scoring import _belongs


def _s(value: Any) -> str:
    return getattr(value, "value", value)


def _why(score) -> List[str]:
    """Human-readable reasons, drawn from the same components the UI shows."""
    reasons = []
    comps = (score.evidence.get("confidence") or {}).get("components", {})
    if comps.get("staleness", 1) < 0.5:
        reasons.append("evidence is older than one half-life")
    if comps.get("agreement", 1) < 0.8:
        reasons.append("sources disagree on this zone")
    if comps.get("recency", 1) < 0.5:
        reasons.append("no recent aerial observation")
    if comps.get("completeness", 1) < 0.7:
        reasons.append("missing expected measurements")
    if not reasons:
        reasons.append("high stakes combined with weak evidence")
    return reasons


def propose(scores: Dict[str, Any], drones: Sequence, missions: Sequence,
            inputs: Sequence) -> Dict[str, Any]:
    """
    Returns proposals, not dispatches. An operator still has to authorise.
    """
    active_zones = {
        getattr(m, "target_zone_id", None)
        for m in missions
        if _s(getattr(m, "type", "")) == "RECONNAISSANCE"
        and _s(getattr(m, "approval_state", "")) in
        ("PROPOSED", "AWAITING_APPROVAL", "APPROVED", "ACTIVE")
    }

    recently_seen = set()
    for i in inputs:
        if _s(getattr(i, "source_type", "")).upper() != "DRONE_TELEMETRY":
            continue
        if float(getattr(i, "freshness_min", 9999) or 9999) <= C.RECON_COOLDOWN_MIN:
            for zid in scores:
                if _belongs(i, _ZoneRef(zid)):
                    recently_seen.add(zid)

    candidates = [
        s for s in scores.values()
        if s.info_value >= C.RECON_INFO_VALUE_THRESHOLD * 100
        and s.zone_id not in active_zones
        and s.zone_id not in recently_seen
    ]
    candidates.sort(key=lambda s: -s.info_value)

    scouts = [
        d for d in drones
        if _s(getattr(d, "role", "")) == "E-SCOUT"
        and _s(getattr(d, "status", "")).upper() in ("STANDBY", "AVAILABLE")
        and int(getattr(d, "battery_pct", 0) or 0) >= C.RECON_MIN_BATTERY_PCT
    ]
    scouts.sort(key=lambda d: -int(getattr(d, "battery_pct", 0) or 0))

    proposals = []
    for score, drone in zip(candidates[:C.RECON_MAX_PROPOSALS], scouts):
        expected_gain = round(0.55 * (1.0 - score.confidence_pct / 100.0) * 100, 1)
        proposals.append({
            "zone_id": score.zone_id,
            "zone_name": score.name,
            "drone_id": getattr(drone, "id", None),
            "callsign": getattr(drone, "callsign", None),
            "info_value": score.info_value,
            "need": score.need,
            "confidence_pct": score.confidence_pct,
            "expected_confidence_gain_pct": expected_gain,
            "reasons": _why(score),
            "rule": (
                f"info_value {score.info_value} >= threshold "
                f"{C.RECON_INFO_VALUE_THRESHOLD * 100:.0f} "
                f"and no observation within {C.RECON_COOLDOWN_MIN} min"
            ),
        })

    skipped = [
        {"zone_id": s.zone_id, "reason": "no available E-SCOUT above battery floor"}
        for s in candidates[len(proposals):]
    ]
    return {"proposals": proposals, "unflyable": skipped, "candidates": len(candidates)}


class _ZoneRef:
    """Tiny shim so _belongs() can be reused for zone-id-only comparisons."""

    def __init__(self, zid: str):
        self.id = zid
        self.name = zid
