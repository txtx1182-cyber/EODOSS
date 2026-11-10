"""
Derived scoring: need, confidence, uncertainty, information value.

Design rule
-----------
NEED and CONFIDENCE are computed separately and never multiplied into one
"priority" number. They are combined only at the *decision* step:

    high need + high confidence  -> dispatch rescue
    high need + low  confidence  -> fly reconnaissance first
    low  need + low  confidence  -> recon only if capacity is spare

That separation is what makes the ranking explainable, and it is what lets the
system say "we do not know enough about the place that matters most".
"""
import math
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional, Sequence

from . import config as C
from .geo import point_to_polyline_km


def _s(value: Any) -> str:
    """Normalise str-enums (RouteStatus.BLOCKED) and plain strings."""
    return getattr(value, "value", value)


def freshness_factor(age_min: float, source_type: str) -> float:
    """Exponential decay with a per-source half-life. 1.0 at age 0."""
    half_life = C.HALF_LIFE_MIN.get(_s(source_type), C.DEFAULT_HALF_LIFE_MIN)
    age_min = max(0.0, float(age_min or 0))
    return 0.5 ** (age_min / half_life)


def _belongs(inp, zone) -> bool:
    """Link an observation to a zone: explicit id first, then location text."""
    zid = getattr(inp, "zone_id", None)
    if zid:
        return zid == zone.id
    text = f"{getattr(inp, 'location_desc', '')} {getattr(inp, 'source_id', '')}".lower()
    short = zone.id.replace("ZONE_", "").lower()
    return zone.name.lower() in text or f"zone {short}" in text or zone.id.lower() in text


def access_at(coords, routes: Sequence, max_km: Optional[float] = None) -> Dict[str, Any]:
    """
    Access is governed by the NEAREST mapped corridor, not the best one.

    There is no road-graph topology here, so "the road you are actually on" is
    the only defensible proxy. Taking the best nearby route instead produced a
    real bug in testing: a depot sitting on a washed-out road was scored as
    reachable because a parallel open road ran 70 m away.
    """
    limit = C.ROUTE_LINK_MAX_KM if max_km is None else max_km
    TIE_KM = 0.05  # corridors within 50 m are treated as equidistant
    best_km, best_factor, best_route, linked = float("inf"), -1.0, None, 0
    for r in routes:
        rc = getattr(r, "coordinates", None) or []
        if len(rc) < 2:
            continue
        km = point_to_polyline_km(coords, rc)
        if km > limit:
            continue
        linked += 1
        proximity = 1.0 - 0.5 * (km / limit)
        factor = C.ACCESS_FACTOR.get(_s(r.status), 0.4) * proximity
        if km < best_km - TIE_KM:
            best_km, best_factor, best_route = km, factor, r
        elif abs(km - best_km) <= TIE_KM and factor > best_factor:
            # equidistant corridors: prefer the usable one, deterministically
            best_km, best_factor, best_route = min(km, best_km), factor, r

    if best_route is None:
        return {
            "access": 0.30, "route_id": None, "distance_km": None,
            "linked_routes": 0,
            "note": "no mapped road access within range (water/air approach only)",
        }

    return {
        "access": round(best_factor, 3),
        "route_id": best_route.id,
        "distance_km": round(best_km, 2),
        "linked_routes": linked,
        "note": f"nearest corridor {best_route.id} ({_s(best_route.status)})",
    }


def route_access(zone, routes: Sequence) -> Dict[str, Any]:
    """Access for a zone, measured at its centre."""
    return access_at(zone.center, routes)


def confidence(zone, inputs: Sequence) -> Dict[str, Any]:
    """
    Assemble confidence (0..1) from evidence quality, not from the model's ego.
    Returns the total plus every component so the UI can explain it.
    """
    zi = [i for i in inputs if _belongs(i, zone)]
    if not zi:
        return {
            "confidence": C.NO_EVIDENCE_CONFIDENCE,
            "components": {k: 0.0 for k in C.CONFIDENCE_WEIGHTS},
            "inputs": 0,
            "note": "no observation linked to this zone",
        }

    mean_conf = sum(float(getattr(i, "confidence_pct", 0) or 0) for i in zi) / len(zi) / 100.0
    staleness = sum(
        freshness_factor(getattr(i, "freshness_min", 9999) or 9999, getattr(i, "source_type", ""))
        for i in zi
    ) / len(zi)
    disputed = sum(1 for i in zi if _s(getattr(i, "status", "")).upper() == "DISPUTED")
    agreement = 1.0 - disputed / len(zi)

    ages = [float(getattr(i, "freshness_min", 9999) or 9999) for i in zi]
    has_drone = any(
        _s(getattr(i, "source_type", "")).upper() == "DRONE_TELEMETRY" and a <= 20
        for i, a in zip(zi, ages)
    )
    if has_drone:
        recency = 1.0
    elif min(ages) <= 60:
        recency = 0.70
    elif min(ages) <= 180:
        recency = 0.45
    else:
        recency = 0.20

    metrics = " ".join(_s(getattr(i, "metric_name", "")).lower() for i in zi)
    present = sum(1 for m in C.EXPECTED_METRICS if m.split("_")[0] in metrics)
    completeness = present / len(C.EXPECTED_METRICS)

    comp = {
        "mean_confidence": mean_conf,
        "staleness": staleness,
        "agreement": agreement,
        "recency": recency,
        "completeness": completeness,
    }
    total = sum(C.CONFIDENCE_WEIGHTS[k] * v for k, v in comp.items())
    total = max(C.CONFIDENCE_FLOOR, min(C.CONFIDENCE_CEIL, total))
    return {
        "confidence": round(total, 3),
        "components": {k: round(v, 3) for k, v in comp.items()},
        "inputs": len(zi),
        "note": "evidence-derived",
    }


@dataclass
class ZoneScore:
    zone_id: str
    name: str
    need: float                 # 0..100  — how badly help is required
    confidence_pct: float       # 0..100  — how much we trust the picture
    uncertainty_pct: float      # 0..100  — 100 - confidence
    info_value: float           # 0..100  — need x unknown (why fly here)
    access: float               # 0..1
    components: Dict[str, float] = field(default_factory=dict)
    evidence: Dict[str, Any] = field(default_factory=dict)
    need_rank: int = 0
    gap_rank: int = 0
    action: str = "MONITOR"

    def to_dict(self):
        return asdict(self)


def score_scene(zones: Sequence, routes: Sequence, inputs: Sequence) -> Dict[str, ZoneScore]:
    """Score every zone in one pass. Pure: no mutation, no I/O."""
    if not zones:
        return {}
    max_pop = max((int(getattr(z, "population_exposed", 0) or 0) for z in zones), default=1) or 1

    out: Dict[str, ZoneScore] = {}
    for z in zones:
        ra = route_access(z, routes)
        cf = confidence(z, inputs)

        exposure = math.log1p(int(getattr(z, "population_exposed", 0) or 0)) / math.log1p(max_pop)
        severity = float(getattr(z, "risk_score", 0.0) or 0.0) / 100.0
        trend = C.TREND_FACTOR.get(_s(getattr(z, "hazard_trend", "STABLE")).upper(), 0.5)
        isolation = 1.0 - ra["access"]

        comp = {
            "exposure": exposure,
            "severity": severity,
            "trend": trend,
            "isolation": isolation,
        }
        need = sum(C.NEED_WEIGHTS[k] * v for k, v in comp.items())
        conf = cf["confidence"]

        out[z.id] = ZoneScore(
            zone_id=z.id,
            name=getattr(z, "name", z.id),
            need=round(need * 100, 1),
            confidence_pct=round(conf * 100, 1),
            uncertainty_pct=round((1 - conf) * 100, 1),
            info_value=round(need * (1 - conf) * 100, 1),
            access=ra["access"],
            components={k: round(v, 3) for k, v in comp.items()},
            evidence={
                "route": ra,
                "confidence": cf,
                "declared_uncertainty": _s(getattr(z, "uncertainty", "")),
            },
        )

    for i, (zid, sc) in enumerate(sorted(out.items(), key=lambda kv: -kv[1].need), 1):
        out[zid].need_rank = i
    for i, (zid, sc) in enumerate(sorted(out.items(), key=lambda kv: -kv[1].info_value), 1):
        out[zid].gap_rank = i

    for sc in out.values():
        if sc.need >= 55 and sc.confidence_pct >= C.VERIFY_FIRST_CONFIDENCE * 100:
            sc.action = "DISPATCH"
        elif sc.need >= 55 and sc.confidence_pct < C.VERIFY_FIRST_CONFIDENCE * 100:
            sc.action = "VERIFY_THEN_DISPATCH"
        elif sc.info_value >= C.RECON_INFO_VALUE_THRESHOLD * 100:
            sc.action = "RECON"
        else:
            sc.action = "MONITOR"
    return out
