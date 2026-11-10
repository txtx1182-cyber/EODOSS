"""
Headless multi-agent comparison.

Same tasks, same fleet, two policies:
  - BASELINE: nearest available unit by straight-line distance (what an EOC
    does by hand under time pressure)
  - ENGINE:   need-weighted, access-aware ETA with depot-cutoff detours

Reported on identical true ETAs, so the comparison is not rigged by the metric.
Run:  python -m eodoss_engine.simulation
"""
import random
from types import SimpleNamespace
from typing import Any, Dict, List

from .allocation import plan, tasks_from_incidents, travel_minutes
from .config import ACCESS_FACTOR, MAX_RESOURCES_PER_TASK
from .geo import haversine_km
from .scoring import access_at, score_scene

KINDS = ("RESCUE_BOAT", "RESCUE_BOAT", "RESCUE_BOAT", "RESCUE_TEAM", "RESCUE_TEAM")


def _s(v):
    return getattr(v, "value", v)


def build_scene(seed: int = 7, n_zones: int = 6, n_incidents: int = 5,
                n_resources: int = 10) -> Dict[str, Any]:
    """Deterministic synthetic Guwahati-scale scene."""
    rng = random.Random(seed)
    base = (26.160, 91.760)

    letters = "ABCDEFGH"
    zones = []
    for i in range(n_zones):
        c = (base[0] + rng.uniform(-0.045, 0.045), base[1] + rng.uniform(-0.045, 0.045))
        zones.append(SimpleNamespace(
            id=f"ZONE_{letters[i]}",
            name=f"Zone {letters[i]}",
            risk_score=round(rng.uniform(35, 95), 1),
            population_exposed=rng.randint(800, 24000),
            hazard_trend=rng.choice(["RISING", "STABLE", "RECEDING"]),
            uncertainty=rng.choice(["LOW", "MODERATE", "HIGH"]),
            center=[c[0], c[1]],
            coordinates=[],
        ))

    statuses = ["ACCESSIBLE", "CAUTION_WATERLOGGING", "BLOCKED", "REPLANNED_ALTERNATE"]
    routes = []
    for i, st in enumerate(statuses):
        a = zones[i % len(zones)].center
        b = zones[(i + 2) % len(zones)].center
        routes.append(SimpleNamespace(
            id=f"RT-{i + 1:02d}", name=f"Route {i + 1}", status=st,
            access_score=int(ACCESS_FACTOR[st] * 100), confidence_pct=70,
            freshness_min=30, coordinates=[list(a), list(b)],
        ))

    resources = []
    for i in range(n_resources):
        kind = KINDS[i % len(KINDS)]
        anchor = zones[rng.randrange(len(zones))].center
        resources.append(SimpleNamespace(
            id=f"RES-{i + 1:02d}", name=f"{kind.title()} {i + 1}", kind=kind,
            status="AVAILABLE", assigned_mission_id=None,
            current_coords=[anchor[0] + rng.uniform(-0.004, 0.004),
                            anchor[1] + rng.uniform(-0.004, 0.004)],
            capacity_persons=rng.choice([6, 8, 8, 10, 12]),
        ))

    incidents = []
    for i in range(n_incidents):
        z = rng.choice(zones)
        incidents.append(SimpleNamespace(
            id=f"INC-{i + 1:02d}", zone_id=z.id, type="STRANDED_RESIDENTS",
            coords=[z.center[0] + rng.uniform(-0.002, 0.002),
                    z.center[1] + rng.uniform(-0.002, 0.002)],
            estimated_count=rng.randint(3, 20),
            confidence_pct=rng.randint(40, 99),
            status="POSSIBLE_INCIDENT" if i % 3 == 0 else "VERIFIED_TARGET",
        ))

    inputs = []
    for z in zones:
        for k, src in enumerate(rng.sample(
                ["RIVER_SENSOR", "WEATHER_RADAR", "LISS4_SATELLITE", "FIELD_REPORT"], 2)):
            inputs.append(SimpleNamespace(
                id=f"IN-{z.id}-{k}", source_type=src,
                confidence_pct=rng.randint(55, 95),
                freshness_min=rng.choice([8, 25, 60, 140, 400, 900]),
                metric_name=rng.choice(["water_level", "rainfall", "inundation_extent"]),
                status=rng.choice(["VERIFIED", "VERIFIED", "UNVERIFIED"]),
                location_desc=f"Zone {z.id.replace('ZONE_', '')} sensor",
            ))

    return {"zones": zones, "routes": routes, "resources": resources,
            "incidents": incidents, "inputs": inputs}


def _metric(scores, tasks, result) -> Dict[str, Any]:
    assigned = result["assignments"]
    req = sum(int(t.get("required_persons", 1)) for t in tasks)
    covered = sum(min(a["covered_persons"], a["required_persons"]) for a in assigned)
    w = sum(a["required_persons"] for a in assigned) or 1
    eta = sum(a["worst_case_eta_min"] * a["required_persons"] for a in assigned) / w
    return {
        "tasks": len(tasks),
        "assigned": len(assigned),
        "unassigned": len(result["unassigned"]),
        "coverage_pct": round(100.0 * covered / max(1, req), 1),
        "need_weighted_eta_min": round(eta, 1),
        "units_used": result["resources_used"],
    }


def _baseline(tasks, resources, zones, routes) -> Dict[str, Any]:
    """Nearest-by-distance policy. Same capability filter, same no-double-booking."""
    busy, assignments, unassigned = set(), [], []
    for task in sorted(tasks, key=lambda t: -(zones.get(t["zone_id"]).need
                                              if zones.get(t["zone_id"]) else 0.0)):
        z = zones.get(task["zone_id"])
        access = z.access if z else 0.4
        pool = [r for r in resources
                if _s(r.status).upper() == "AVAILABLE" and r.id not in busy
                and _s(r.kind) in ("RESCUE_BOAT", "RESCUE_TEAM")]
        if not pool:
            unassigned.append({"task_id": task["id"], "zone_id": task["zone_id"],
                               "reason": "no unit"})
            continue
        pool.sort(key=lambda r: haversine_km(r.current_coords, task["coords"]))
        chosen, covered = [], 0
        for r in pool:
            if len(chosen) >= MAX_RESOURCES_PER_TASK:
                break
            if covered >= task["required_persons"] and chosen:
                break
            st = access_at(r.current_coords, routes)["access"]
            t = travel_minutes(r, task["coords"], access, st)
            chosen.append({"resource_id": r.id, "kind": r.kind,
                           "eta_min": t["eta_min"], "capacity": r.capacity_persons})
            busy.add(r.id)
            covered += max(1, r.capacity_persons)
        assignments.append({
            "task_id": task["id"], "zone_id": task["zone_id"],
            "resources": chosen, "covered_persons": covered,
            "required_persons": task["required_persons"],
            "worst_case_eta_min": max(c["eta_min"] for c in chosen),
        })
    return {"assignments": assignments, "unassigned": unassigned,
            "resources_used": len(busy), "decision_log": []}


def run(seed: int = 7) -> Dict[str, Any]:
    scene = build_scene(seed=seed)
    scores = score_scene(scene["zones"], scene["routes"], scene["inputs"])
    tasks = tasks_from_incidents(scene["incidents"], scores)

    engine = plan(tasks, scene["resources"], scores, scene["routes"])
    base = _baseline(tasks, scene["resources"], scores, scene["routes"])

    m_engine = _metric(scores, tasks, engine)
    m_base = _metric(scores, tasks, base)

    eta_gain = 100.0 * (m_base["need_weighted_eta_min"] - m_engine["need_weighted_eta_min"]) / \
        max(1e-6, m_base["need_weighted_eta_min"])
    cov_gain = m_engine["coverage_pct"] - m_base["coverage_pct"]

    return {
        "seed": seed,
        "engine": m_engine,
        "baseline": m_base,
        "eta_improvement_pct": round(eta_gain, 1),
        "coverage_delta_pct": round(cov_gain, 1),
        "scores": scores,
        "engine_detail": engine,
    }


def main():
    r = run()
    print(f"EODOSS headless comparison  (seed={r['seed']})")
    print(f"{'metric':<28}{'baseline':>12}{'engine':>12}")
    for k in ("tasks", "assigned", "unassigned", "coverage_pct",
              "need_weighted_eta_min", "units_used"):
        print(f"{k:<28}{r['baseline'][k]:>12}{r['engine'][k]:>12}")
    print(f"\nneed-weighted ETA improvement: {r['eta_improvement_pct']}%")
    print(f"coverage delta:               {r['coverage_delta_pct']} pp")


if __name__ == "__main__":
    main()
