"""Unit tests for the EODOSS decision core. Run: python -m eodoss_engine.tests.test_engine"""
import math
from types import SimpleNamespace

from app.engine import config as C
from app.engine.allocation import plan, travel_minutes
from app.engine.geo import haversine_km
from app.engine.recon import propose
from app.engine.recompute import derive, diff
from app.engine.scoring import access_at, confidence, freshness_factor, score_scene
from app.engine.simulation import build_scene

PASS, FAIL = [], []


def check(name, cond, detail=""):
    (PASS if cond else FAIL).append(name)
    print(("  PASS  " if cond else "  FAIL  ") + name + (f"   [{detail}]" if detail else ""))


def zone(zid="ZONE_A", center=(26.17, 91.75), pop=5000, risk=60.0,
         trend="STABLE", unc="MODERATE"):
    return SimpleNamespace(id=zid, name=f"Zone {zid[-1]}", risk_score=risk,
                           population_exposed=pop, hazard_trend=trend,
                           uncertainty=unc, center=list(center), coordinates=[])


def route(rid="RT-01", status="ACCESSIBLE", a=(26.16, 91.74), b=(26.18, 91.76)):
    return SimpleNamespace(id=rid, name=rid, status=status, access_score=90,
                           confidence_pct=80, freshness_min=20,
                           coordinates=[list(a), list(b)])


def obs(zone_id, source="RIVER_SENSOR", fresh=10, conf=90, metric="water_level",
        status="VERIFIED"):
    return SimpleNamespace(id=f"IN-{zone_id}-{metric}", zone_id=zone_id,
                           source_type=source, confidence_pct=conf,
                           freshness_min=fresh, metric_name=metric,
                           status=status, location_desc=f"{zone_id} sensor")


# ---------------------------------------------------------------- 1. decay
def test_decay():
    print("\n1. Freshness decay")
    hl = C.HALF_LIFE_MIN["RIVER_SENSOR"]
    check("fresh observation has full weight", abs(freshness_factor(0, "RIVER_SENSOR") - 1.0) < 1e-9)
    check("one half-life halves the weight",
          abs(freshness_factor(hl, "RIVER_SENSOR") - 0.5) < 1e-9,
          f"half-life={hl} min")
    check("two half-lives quarter it",
          abs(freshness_factor(2 * hl, "RIVER_SENSOR") - 0.25) < 1e-9)
    check("satellite decays slower than radar",
          freshness_factor(300, "LISS4_SATELLITE") > freshness_factor(300, "WEATHER_RADAR"))


# ---------------------------------------------------------------- 2. confidence
def test_confidence():
    print("\n2. Confidence responds to evidence quality")
    z = zone()
    fresh = [obs(z.id, fresh=5, conf=95), obs(z.id, fresh=10, conf=90)]
    stale = [obs(z.id, fresh=600, conf=95), obs(z.id, fresh=900, conf=90)]
    c_fresh = confidence(z, fresh)["confidence"]
    c_stale = confidence(z, stale)["confidence"]
    check("fresh evidence scores higher than stale", c_fresh > c_stale,
          f"{c_fresh:.2f} vs {c_stale:.2f}")

    disputed = [obs(z.id, fresh=5, conf=95, status="DISPUTED"),
                obs(z.id, fresh=10, conf=90, status="DISPUTED")]
    check("disputed sources reduce confidence",
          confidence(z, disputed)["confidence"] < c_fresh)

    no_ev = confidence(z, [])["confidence"]
    check("no evidence gives a floor, not a guess", abs(no_ev - C.NO_EVIDENCE_CONFIDENCE) < 1e-9,
          f"{no_ev:.2f}")


# ---------------------------------------------------------------- 3. need
def test_need():
    print("\n3. Need responds to exposure, severity and isolation")
    a = zone("ZONE_A", (26.17, 91.75), pop=5000)
    b = zone("ZONE_B", (26.17, 91.75), pop=5000)
    routes = [route("RT-01", "ACCESSIBLE", (26.16, 91.74), (26.18, 91.76))]
    s = score_scene([a], routes, [])

    a_blocked = zone("ZONE_C", (26.30, 91.90), pop=5000)   # far from any route
    s2 = score_scene([a_blocked], routes, [])
    check("no mapped access raises need vs good access",
          s2["ZONE_C"].need > s["ZONE_A"].need,
          f"{s2['ZONE_C'].need} vs {s['ZONE_A'].need}")

    pop_big = zone("ZONE_D", (26.17, 91.75), pop=40000)
    s3 = score_scene([zone("ZONE_E", (26.17, 91.75), pop=1000), pop_big], routes, [])
    check("higher population raises need", s3["ZONE_D"].need > s3["ZONE_E"].need,
          f"{s3['ZONE_D'].need} vs {s3['ZONE_E'].need}")

    rising = zone("ZONE_F", (26.17, 91.75), pop=5000, trend="RISING")
    receding = zone("ZONE_G", (26.17, 91.75), pop=5000, trend="RECEDING")
    s4 = score_scene([rising, receding], routes, [])
    check("rising hazard outranks receding", s4["ZONE_F"].need > s4["ZONE_G"].need,
          f"{s4['ZONE_F'].need} vs {s4['ZONE_G'].need}")


# ---------------------------------------------------------------- 4. info value
def test_info_value():
    print("\n4. Information value = need x unknown")
    routes = [route("RT-01", "ACCESSIBLE", (26.16, 91.74), (26.18, 91.76))]
    urgent_unknown = zone("ZONE_A", (26.17, 91.75), pop=20000, risk=90, trend="RISING")
    calm_known = zone("ZONE_B", (26.17, 91.75), pop=500, risk=30, trend="STABLE")
    inputs = [obs("ZONE_A", fresh=900, conf=70),
              obs("ZONE_B", fresh=2, conf=95, metric="water_level"),
              obs("ZONE_B", fresh=2, conf=95, metric="rainfall"),
              obs("ZONE_B", fresh=2, conf=95, metric="inundation_extent")]
    s = score_scene([urgent_unknown, calm_known], routes, inputs)
    check("urgent-but-unknown zone has high information value",
          s["ZONE_A"].info_value > s["ZONE_B"].info_value,
          f"{s['ZONE_A'].info_value} vs {s['ZONE_B'].info_value}")
    check("info value uses confidence, not just need",
          abs(s["ZONE_A"].info_value -
              round(s["ZONE_A"].need * s["ZONE_A"].uncertainty_pct / 100, 1)) < 0.15)
    check("recommended action differs for known vs unknown",
          s["ZONE_A"].action in ("VERIFY_THEN_DISPATCH", "RECON", "DISPATCH")
          and s["ZONE_B"].action in ("MONITOR", "RECON"),
          f"{s['ZONE_A'].action} / {s['ZONE_B'].action}")


# ---------------------------------------------------------------- 5. no double booking
def test_no_double_booking():
    print("\n5. Allocation never double-books a unit")
    routes = [route("RT-01", "ACCESSIBLE", (26.16, 91.74), (26.18, 91.76))]
    z = zone("ZONE_A", (26.17, 91.75))
    scores = score_scene([z], routes, [obs("ZONE_A", fresh=5)])
    res = [SimpleNamespace(id="RES-01", kind="RESCUE_BOAT", status="AVAILABLE",
                           current_coords=[26.170, 91.750], capacity_persons=8)]
    tasks = [{"id": "INC-01", "type": "RESCUE_DISPATCH", "zone_id": "ZONE_A",
              "coords": [26.17, 91.75], "required_persons": 5, "confidence_pct": 90},
             {"id": "INC-02", "type": "RESCUE_DISPATCH", "zone_id": "ZONE_A",
              "coords": [26.171, 91.751], "required_persons": 5, "confidence_pct": 80}]
    out = plan(tasks, res, scores, routes)
    check("one unit serves one task", len(out["assignments"]) == 1, str(len(out["assignments"])))
    check("second task is explicitly unassigned", len(out["unassigned"]) == 1)
    check("units_used equals assignments", out["resources_used"] == 1)

    res.append(SimpleNamespace(id="RES-02", kind="RESCUE_BOAT", status="AVAILABLE",
                               current_coords=[26.171, 91.751], capacity_persons=8))
    out2 = plan(tasks, res, scores, routes)
    used = [r["resource_id"] for a in out2["assignments"] for r in a["resources"]]
    check("two units, two tasks, no overlap", len(used) == len(set(used)) == 2, str(used))


# ---------------------------------------------------------------- 6. cut-off depot
def test_cutoff_depot():
    print("\n6. A cut-off depot loses to a distant clear one")
    open_route = route("RT-01", "ACCESSIBLE", (26.16, 91.74), (26.18, 91.76))
    # A washed-out spur that runs through the depot, ~390 m from the open corridor
    blocked_route = route("RT-02", "BLOCKED", (26.1735, 91.7495), (26.1745, 91.7515))
    routes = [open_route, blocked_route]
    z = zone("ZONE_A", (26.17, 91.75))
    scores = score_scene([z], routes, [obs("ZONE_A", fresh=5, conf=95)])

    near_but_cut = SimpleNamespace(id="RES-NEAR", kind="RESCUE_BOAT", status="AVAILABLE",
                                   current_coords=[26.174, 91.7505], capacity_persons=8)
    far_but_clear = SimpleNamespace(id="RES-FAR", kind="RESCUE_BOAT", status="AVAILABLE",
                                    current_coords=[26.20, 91.78], capacity_persons=8)

    t_near = travel_minutes(near_but_cut, [26.17, 91.75], scores["ZONE_A"].access,
                            access_at(near_but_cut.current_coords, routes)["access"])
    t_far = travel_minutes(far_but_clear, [26.17, 91.75], scores["ZONE_A"].access,
                           access_at(far_but_clear.current_coords, routes)["access"])
    check("cut-off depot pays a detour", t_near["detour_min"] > 0, str(t_near))
    check("cut-off depot is effectively slower despite being closer",
          t_near["eta_min"] > t_far["eta_min"],
          f"{t_near['eta_min']} vs {t_far['eta_min']}")

    tasks = [{"id": "INC-01", "type": "RESCUE_DISPATCH", "zone_id": "ZONE_A",
              "coords": [26.17, 91.75], "required_persons": 5, "confidence_pct": 95}]
    out = plan(tasks, [near_but_cut, far_but_clear], scores, routes)
    chosen = out["assignments"][0]["resources"][0]["resource_id"]
    check("allocator picks the reachable unit", chosen == "RES-FAR", chosen)


# ---------------------------------------------------------------- 7. recon rule
def test_recon():
    print("\n7. Recon is proposed by rule, not by button")
    routes = [route("RT-01", "ACCESSIBLE", (26.16, 91.74), (26.18, 91.76))]
    urgent_unknown = zone("ZONE_A", (26.17, 91.75), pop=20000, risk=90, trend="RISING")
    calm = zone("ZONE_B", (26.17, 91.75), pop=400, risk=25, trend="STABLE")
    inputs = [obs("ZONE_A", fresh=900, conf=60), obs("ZONE_B", fresh=3, conf=95)]
    scores = score_scene([urgent_unknown, calm], routes, inputs)

    scouts = [SimpleNamespace(id="DRN-SC-01", callsign="E-SCOUT-01", role="E-SCOUT",
                              status="STANDBY", battery_pct=88),
              SimpleNamespace(id="DRN-SC-02", callsign="E-SCOUT-02", role="E-SCOUT",
                              status="STANDBY", battery_pct=64)]
    out = propose(scores, scouts, [], inputs)
    top = out["proposals"][0]["zone_id"] if out["proposals"] else None
    check("top proposal is the high-stakes unknown", top == "ZONE_A", str(top))
    check("proposal carries a reason", bool(out["proposals"][0]["reasons"]),
          str(out["proposals"][0]["reasons"]))

    inputs.append(obs("ZONE_A", source="DRONE_TELEMETRY", fresh=5, conf=95))
    scores2 = score_scene([urgent_unknown, calm], routes, inputs)
    out2 = propose(scores2, scouts, [], inputs)
    zids = [p["zone_id"] for p in out2["proposals"]]
    check("recently observed zone is not re-tasked", "ZONE_A" not in zids, str(zids))

    low_battery = [SimpleNamespace(id="DRN-SC-01", callsign="E-SCOUT-01", role="E-SCOUT",
                                   status="STANDBY", battery_pct=12)]
    out3 = propose(scores, low_battery, [], [obs("ZONE_A", fresh=900, conf=60)])
    check("no proposal when no airframe can fly", out3["proposals"] == [] and out3["unflyable"])


# ---------------------------------------------------------------- 8. recompute + diff
def test_recompute():
    print("\n8. Recompute produces an explainable diff")
    scene = build_scene(seed=3)
    situation = SimpleNamespace(
        zones=scene["zones"], routes=scene["routes"], resources=scene["resources"],
        incidents=scene["incidents"], recent_inputs=scene["inputs"],
        drones=[SimpleNamespace(id="DRN-SC-01", callsign="E-SCOUT-01", role="E-SCOUT",
                                status="STANDBY", battery_pct=90),
                SimpleNamespace(id="DRN-CG-01", callsign="E-CARGO-01", role="E-CARGO",
                                status="STANDBY", battery_pct=80)],
        missions=[],
    )
    d1 = derive(situation)
    check("derive scores every zone", len(d1["zones"]) == len(scene["zones"]))
    check("derive allocates tasks", len(d1["allocation"]["assignments"]) > 0,
          f"{len(d1['allocation']['assignments'])} assigned")

    scene["routes"][0].status = "BLOCKED"
    d2 = derive(situation)
    changes = diff(d1, d2)
    check("blocking a route produces changes", len(changes) > 0, f"{len(changes)} changes")
    check("changes name the field and the cause",
          all({"entity", "id", "field", "old", "new"} <= set(c) for c in changes))
    n_assign = sum(1 for c in changes if c["entity"] == "task")
    print(f"        ({n_assign} reassignments recorded)")


def main():
    print("=" * 64)
    print("EODOSS decision core — test suite")
    print("=" * 64)
    for fn in (test_decay, test_confidence, test_need, test_info_value,
               test_no_double_booking, test_cutoff_depot, test_recon, test_recompute):
        fn()
    print("\n" + "=" * 64)
    print(f"{len(PASS)} passed, {len(FAIL)} failed")
    if FAIL:
        for f in FAIL:
            print("  FAILED:", f)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
