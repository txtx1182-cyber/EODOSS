# EODOSS — Build Plan for Antigravity

**Purpose:** the executable version of [EODOSS_completion_plan.md](EODOSS_completion_plan.md). Each task below has a goal, the exact files it touches, a behaviour contract, and an acceptance test an agent can run and self-verify. Nothing here asks for judgement — only execution.

**Repo:** `https://github.com/txtx1182-cyber/EODOSS`
**Stack:** FastAPI + Pydantic (in-memory state) · React + TS + Vite · Leaflet · single Docker image on Render
**Current state:** working UI, scripted orchestration, no allocation engine, no recon rule, no live feed.

---

## 0. Ground truth the agent must read first

| File | Why |
|---|---|
| `backend/app/models.py` | The state schema it must not break |
| `backend/app/orchestration.py` | The scripted logic it is replacing |
| `backend/app/main.py` | Endpoints + `/ws/live` broadcast |
| `backend/app/seed_data.py` | Scenario constants (zones, routes, resources) |
| `frontend/src/types/situation.ts` | TS mirror of the models |
| `frontend/src/index.css` | Design tokens |
| `frontend/src/components/DecisionQueueRack.tsx` | Where derived scores will surface |

---

## 1. Phase 0 — prepare (manual, 10 minutes)

The reference engine is already written and tested. Get it into the repo:

1. Copy the folder `eodoss_engine/` → `backend/app/engine/` (rename the folder to `engine`).
2. In `backend/app/engine/tests/test_engine.py`, replace every `from eodoss_engine` with `from app.engine`.
3. In `backend/app/engine/__init__.py`, no change needed (relative imports).
4. Verify from `backend/`:

```powershell
python -m app.engine.tests.test_engine     # expect: 28 passed, 0 failed
python -m app.engine.simulation            # expect: baseline vs engine table
```

If those two commands pass, every later task is integration, not invention.

> The engine is stdlib-only on purpose. **Do not add dependencies to it** — no numpy, no scipy, no OR-Tools. It must run inside the existing image unchanged.

---

## 2. API contracts (freeze these before frontend work)

### `GET /api/engine/derived`

```json
{
  "version": 3,
  "zones": {
    "ZONE_F": {
      "zone_id": "ZONE_F",
      "name": "Chandrapur & Eastern Riverbank",
      "need": 80.0,
      "confidence_pct": 49.8,
      "uncertainty_pct": 50.2,
      "info_value": 40.2,
      "access": 0.10,
      "components": {"exposure": 1.0, "severity": 0.88, "trend": 1.0, "isolation": 0.9},
      "evidence": {
        "route": {"access": 0.10, "route_id": "RT-03", "distance_km": 0.4,
                  "linked_routes": 2, "note": "nearest corridor RT-03 (BLOCKED)"},
        "confidence": {"confidence": 0.498, "inputs": 3,
                       "components": {"mean_confidence": 0.82, "staleness": 0.31,
                                      "agreement": 1.0, "recency": 0.2, "completeness": 0.67},
                       "note": "evidence-derived"},
        "declared_uncertainty": "HIGH"
      },
      "need_rank": 1,
      "gap_rank": 1,
      "action": "VERIFY_THEN_DISPATCH"
    }
  },
  "allocation": {
    "assignments": [{
      "task_id": "INC-01", "zone_id": "ZONE_F", "type": "RESCUE_DISPATCH",
      "resources": [{"resource_id": "RES-NDRF-01", "kind": "RESCUE_TEAM",
                     "capacity": 10, "eta_min": 14.2, "distance_km": 3.4,
                     "station_access": 1.0, "utility": 58.9}],
      "covered_persons": 10, "required_persons": 14, "coverage": 0.71,
      "worst_case_eta_min": 14.2, "needs_verification": false,
      "reason": "RESCUE_TEAM RES-NDRF-01 (3.4 km, ETA 14.2 min, access 0.10, need 80.0)"
    }],
    "unassigned": [{"task_id": "INC-02", "zone_id": "ZONE_D", "reason": "no AVAILABLE resource with capability (...)"}],
    "decision_log": [{"task_id": "INC-01", "zone_id": "ZONE_F", "need": 80.0,
                      "access": 0.1, "candidates_considered": []}],
    "resources_used": 3
  },
  "recon": {
    "proposals": [{"zone_id": "ZONE_D", "zone_name": "...", "drone_id": "DRN-SC-01",
                   "callsign": "E-SCOUT-01", "info_value": 44.1, "need": 76.0,
                   "confidence_pct": 42.0, "expected_confidence_gain_pct": 31.9,
                   "reasons": ["evidence is older than one half-life", "no recent aerial observation"],
                   "rule": "info_value 44.1 >= threshold 35 and no observation within 20 min"}],
    "unflyable": [], "candidates": 2
  },
  "counts": {"zones": 6, "tasks": 2, "assigned": 1, "unassigned": 1, "recon_proposals": 1}
}
```

### `POST /api/missions/recon`

```json
// request
{ "zone_id": "ZONE_D", "drone_id": "DRN-SC-01" }
// 200
{ "status": "DISPATCHED", "zone_id": "ZONE_D",
  "justification": "info_value 44.1 (need 76.0, confidence 42%)" }
// 400 when no proposal exists for that zone
{ "detail": "No active recon proposal for ZONE_D" }
```

### `POST /api/engine/recompute`

Returns `{ "changes": [ {entity, id, field, old, new} ], "counts": {...} }` and appends the corresponding entries to `audit_log`.

### Invariants — the agent must not break these

1. `GET /api/situation` keeps its **exact current shape**. New data goes in `/api/engine/derived`, never bolted onto the situation model.
2. `/ws/live` still broadcasts the full situation on every mutation.
3. The 5-minute timer, escalation, approval gate and audit trail keep working.
4. All sim data stays labelled `Training Simulation · Seeded Scenario`.
5. No new Python or npm dependencies.
6. `Seeded` and `LIVE` values are never mixed without a visible badge.

---

## 3. Task queue

Each task is independently shippable. Do not start a task until the previous one's acceptance test passes.

---

### T1 — Engine in-repo  · P0 · 30 min

**Goal:** the engine package exists, tests pass, nothing imports it yet.
**Files:** `backend/app/engine/**` (copy + import rewrite).
**Acceptance:**
```powershell
cd backend
python -m app.engine.tests.test_engine   # 28 passed, 0 failed
python -m app.engine.simulation          # prints comparison table
```
**Risk:** package path. If `app.engine.tests` fails, the folder name is wrong — it must be `app/engine/`, not `app/eodoss_engine/`.

---

### T2 — Derived state in the API · P0 · 3 h

**Goal:** every mutation produces derived scores, a diff, and audit lines.
**Files:** `backend/app/main.py`, `backend/app/models.py` (one field), `backend/app/orchestration.py` (no logic change).

**Changes:**
1. `models.py` → `PredictionInput` gains `zone_id: Optional[str] = None`.
2. `main.py`:
```python
from app.engine.recompute import derive, diff, audit_events
_derived: dict = {}
_prev_derived: dict = {}

def _recompute():
    global _derived, _prev_derived
    _prev_derived, _derived = _derived, derive(current_situation)
    for ev in audit_events(diff(_prev_derived, _derived)):
        ev["id"] = f"AUD-{len(current_situation.audit_log) + 1:03d}"
        ev["timestamp"] = datetime.now(timezone.utc).isoformat()
        current_situation.audit_log.insert(0, AuditEvent(**ev))
```
3. Call `_recompute()` inside every mutating endpoint **before** `await broadcast_situation()`: confirm, monitor, escalate, missions/recon, missions/approve, missions/cargo-drop, mutual-aid/approve, situation/reset.
4. Add:
```python
@app.get("/api/engine/derived")
def get_derived():
    return _derived

@app.post("/api/engine/recompute")
async def recompute_now():
    before = _prev_derived
    _recompute()
    changes = diff(before, _derived)
    await broadcast_situation()
    return {"changes": changes, "counts": _derived["counts"]}
```
5. On module load, call `_recompute()` once so the endpoint is never empty.

**Acceptance:**
```powershell
curl http://127.0.0.1:8000/api/engine/derived          # zones.ZONE_F has need/confidence_pct/info_value/action
curl -X POST http://127.0.0.1:8000/api/alert/confirm -H "Content-Type: application/json" -d '{"user_id":"test"}'
curl http://127.0.0.1:8000/api/situation               # audit_log has PRIORITY_RECALCULATED / RECOMMENDATION_CHANGED
curl http://127.0.0.1:8000/api/engine/derived          # counts.assigned increased
```
**Risk:** `AuditEvent(**ev)` requires exact field names — `audit_events()` already emits `source_module, action, details, confidence_pct, user_id`. Do not add `id`/`timestamp` inside the helper.

---

### T3 — Real allocation replaces hardcoded missions · P0 · 4 h

**Goal:** `_generate_rescue_missions()` stops hardcoding `RES-SDRF-BOAT-03` and derives assignments from incidents.
**Files:** `backend/app/orchestration.py`.

**Contract:**
- Build tasks with `tasks_from_incidents(state.incidents, derived_zones)`.
- Call `plan(tasks, state.resources, derived_zones, state.routes)`.
- For each assignment, create a `Mission` **only if** `f"MSN-{task_id}"` does not already exist (idempotent).
- Mission fields:
  - `id = f"MSN-{task_id}"`
  - `assigned_resources = [r["resource_id"] for r in assignment["resources"]]`
  - `priority = "URGENT" if need >= 75 else "HIGH" if need >= 55 else "MEDIUM"`
  - `approval_state = AWAITING_APPROVAL`
  - `explanation = {"evidence": assignment["reason"], "confidence_pct": zone.confidence_pct, "urgency": priority, "approval_required": True, "eta_min": assignment["worst_case_eta_min"], "coverage": assignment["coverage"], "score_inputs": zone.components}`
- Unassigned tasks are **not** silently dropped: append an audit event `NO_RESOURCE_AVAILABLE` with the reason.

**Acceptance:**
- `POST /api/situation/reset` → missions contain one `MSN-INC-01`; no mission references a resource that is already `DEPLOYED`.
- Flip a boat to `DEPLOYED` in seed data → re-run → the boat no longer appears in any new mission.
- Two incidents in the same zone with only one boat → second task appears in `unassigned` and an `NO_RESOURCE_AVAILABLE` audit entry exists.
- Every mission's `explanation.evidence` contains `km`, `ETA`, `access`.

**Risk:** `approve_mission()` sets resources `DEPLOYED`. Re-running allocation must treat `DEPLOYED` as unavailable (the engine already filters on `status == AVAILABLE`).

---

### T4 — Recon proposal, not a button · P0 · 4 h

**Goal:** the drone flies because a rule fired, and its finding changes the scores through data — not through a hardcoded function.
**Files:** `backend/app/orchestration.py`, `backend/app/main.py`.

**Changes:**
1. Delete the body of `_simulate_drone_recon_findings()`.
2. New `_apply_recon_effect(zone_id: str)`:
   - append three `PredictionInput` rows for `zone_id`: `DRONE_TELEMETRY` (freshness 1, confidence 97, `water_level`), `DRONE_TELEMETRY` (freshness 1, confidence 95, `inundation_extent`), `DRONE_TELEMETRY` (freshness 1, confidence 93, `route_access`);
   - update `route.freshness_min = 1` and `confidence_pct = 99` for the route nearest that zone (use `access_at(zone.center, routes)["route_id"]`);
   - **do not** set route status directly. Status changes only if the operator does it.
3. `dispatch_reconnaissance(zone_id, drone_id)` validates against the current derived `recon.proposals`; raises `ValueError("No active recon proposal for <zone>")` otherwise.
4. `POST /api/missions/recon` takes `{zone_id, drone_id}`; returns `400` with that message when invalid.
5. `/api/engine/derived` → `recon.proposals` is the UI's source of truth.

**Acceptance:**
- Fresh reset → `/api/engine/derived` lists ≥1 proposal (Zone D or F, whichever has `info_value ≥ 35`).
- `POST /api/missions/recon {"zone_id": "ZONE_A"}` (no proposal) → **400**, no state change.
- `POST /api/missions/recon` with the proposed zone → 200; re-fetch derived → that zone's `confidence_pct` rose ≥ 20 points, its `info_value` fell, and its proposal is gone.
- Audit contains `RECON_DISPATCHED` followed by ≥1 `PRIORITY_RECALCULATED` whose `details` names the zone.

**Risk:** `recon.py` excludes zones observed within `RECON_COOLDOWN_MIN`. After a flight the zone must not immediately re-propose — that behaviour is correct, not a bug.

---

### T5 — One live feed + feed registry · P1 · 3 h

**Goal:** one ingestion path is genuinely live and visibly different from seeded data.
**Files:** new `backend/app/adapters.py`, `backend/app/main.py`, `backend/app/engine/config.py` (no weights).

**Contract:**
```python
FEEDS = {
  "open_meteo":  {"status": "live",            "kind": "WEATHER_RADAR"},
  "cwc_gauge":   {"status": "archived",        "kind": "RIVER_SENSOR"},
  "sentinel1":   {"status": "not_configured",  "kind": "SATELLITE"},
  "sentinel2":   {"status": "not_configured",  "kind": "SATELLITE"},
  "glofas":      {"status": "not_configured",  "kind": "MODEL"},
  "imd":         {"status": "not_configured",  "kind": "WEATHER_RADAR"},
  "bhuvan":      {"status": "not_configured",  "kind": "SATELLITE"},
}

def fetch_open_meteo(lat=26.17, lng=91.75, timeout=5) -> dict | None
```
- `fetch_open_meteo` calls `https://api.open-meteo.com/v1/forecast?latitude=26.17&longitude=91.75&hourly=precipitation&forecast_days=1`, reads `hourly.precipitation[0]`, returns a `PredictionInput`-shaped dict with `source_type="WEATHER_RADAR"`, `source_id="open-meteo"`, real `timestamp`, `freshness_min=0`, `confidence_pct=85`, `status="UNVERIFIED"`, `metric_name="rainfall"`, `zone_id` = the zone whose centre is nearest.
- On any exception or timeout: return `None`. **Never raise.**
- `POST /api/ingest/refresh` → append the input if not `None`, `_recompute()`, broadcast, return `{"ingested": bool, "degraded": bool, "feeds": FEEDS}`.
- `GET /api/ingest/feeds` → `FEEDS`.

**Acceptance:**
- With network: `POST /api/ingest/refresh` → `ingested: true`, `recent_inputs[0].source_type == "WEATHER_RADAR"`, derived confidence for that zone moved.
- With network disabled: same call → HTTP **200**, `ingested: false, degraded: true`, situation otherwise unchanged. No 500.
- UI can distinguish it: the input carries `source_id="open-meteo"` and `freshness_min=0`.

---

### T6 — Frontend: uncertainty & conflict get a visual language · P1 · 4 h

**Goal:** the console can display "we do not know" and "sources disagree" without inventing a fifth hazard colour.
**Files:** `frontend/src/index.css`, `frontend/src/components/views/SituationMapView.tsx` (or wherever the zone panel lives), new `frontend/src/components/EvidenceChips.tsx`, `frontend/src/types/situation.ts`.

**Design decision (do not substitute):**
```css
--color-uncertainty: #6E7B8B;  /* slate — informational, NOT a hazard level */
--color-conflict:    #8C4A6B;  /* muted plum — reserved for disputed evidence */
```
- Uncertainty is rendered as **hatching + dashed outline** on a zone, never as a fill colour. A user must not mistake "unknown" for "severe".
- Conflict is a small badge on the evidence chip only.

**EvidenceChips** — three chips for the selected zone, values read from `/api/engine/derived`:
```
NEED 80        KNOW 50%        ACCESS 0.10
exposure·severity·trend·isolation   3 inputs, staleness 0.31   via RT-03 (BLOCKED)
```
- Each chip has a `title` tooltip listing `components` / `confidence.components`.
- If `evidence.confidence.inputs == 0`, the KNOW chip renders as `NO EVIDENCE` in `--color-conflict`.

**Acceptance:** clicking Zone F shows three chips whose numbers equal `/api/engine/derived.zones.ZONE_F.{need,confidence_pct,access}`; after a recon flight the KNOW chip increases without a page reload (WebSocket path).

---

### T7 — Decision quadrant · P1 · 3 h

**Goal:** the 2×2 rule becomes visible, not just documented.
**Files:** new `frontend/src/components/DecisionQuadrant.tsx`, mounted in the right panel above the queue.

**Layout:** four cells, each listing zone ids sorted by `need` desc.
```
                HIGH CONFIDENCE        LOW CONFIDENCE
HIGH NEED       DISPATCH               VERIFY, THEN DISPATCH
                ZONE_F                  ZONE_D
LOW NEED        MONITOR                RECON IF SPARE
                ZONE_A, ZONE_C          ZONE_B
```
Thresholds come from the API (`action` field), not hardcoded in TS.

**Acceptance:** blocking RT-03 moves Zone F between cells after the next recompute; the cell label matches `action` exactly.

---

### T8 — Scale test in the UI · P2 · 2 h

**Goal:** the multi-agent claim becomes a number.
**Files:** `backend/app/main.py`, new `frontend/src/components/ScaleTestModal.tsx`.

- `GET /api/engine/simulation?seed=7` → `run(seed)` result.
- Modal shows the baseline-vs-engine table and the two headline numbers.
- Label: `"Synthetic scenario · seed 7 · 6 zones, 5 incidents, 10 units"`. Never present as a field result.

**Acceptance:** numbers match `python -m app.engine.simulation`; same seed returns identical numbers across calls.

---

### T9 — Documentation honesty pass · P2 · 2 h

**Files:** `README.md`, `EODOSS_COMPLIANCE_REPORT.md` (or equivalent), `docs/`.

- README gets an **Implemented / Simulated / Not implemented** table (three columns, no adjectives).
- Replace "AI-powered" with "rule-based decision support over a seeded scenario".
- Add `docs/BUILD_PLAN.md` (this file) to the repo so the next agent inherits the contract.
- Fix the event name in all docs to one spelling.

**Acceptance:** a reader can tell, from the README alone, exactly which numbers are computed and which are constants.

---

### T10 — Deploy and smoke test · P2 · 2 h

1. `POST /api/situation/reset` calls `_recompute()` and returns 200.
2. `docker build` succeeds; image starts with no network and serves `/api/engine/derived`.
3. Push; wait for Render; run the smoke list below.

**Smoke list (must all pass on the live URL):**
- login → map renders → `/api/engine/derived` returns 6 zones
- confirm disaster → audit grows → missions generated
- approve mission → resources `DEPLOYED`, second approval of same mission is rejected
- recon proposal visible → dispatch → confidence rises → proposal disappears
- block a route manually → next recompute reassigns → audit shows `REPLAN_APPLIED`
- no console errors; `/ws/live` reconnects after a refresh

---

## 4. Frontend type additions

```ts
// frontend/src/types/situation.ts
export interface DerivedZone {
  zone_id: string; name: string;
  need: number; confidence_pct: number; uncertainty_pct: number;
  info_value: number; access: number;
  components: { exposure: number; severity: number; trend: number; isolation: number };
  evidence: {
    route: { access: number; route_id: string | null; distance_km: number | null; linked_routes: number; note: string };
    confidence: { confidence: number; inputs: number; components: Record<string, number>; note: string };
    declared_uncertainty: string;
  };
  need_rank: number; gap_rank: number;
  action: 'DISPATCH' | 'VERIFY_THEN_DISPATCH' | 'RECON' | 'MONITOR';
}

export interface DerivedState {
  version: number;
  zones: Record<string, DerivedZone>;
  allocation: {
    assignments: {
      task_id: string; zone_id: string; type: string;
      resources: { resource_id: string; kind: string; capacity: number; eta_min: number;
                   distance_km: number; station_access: number; utility: number }[];
      covered_persons: number; required_persons: number; coverage: number;
      worst_case_eta_min: number; needs_verification: boolean; reason: string;
    }[];
    unassigned: { task_id: string; zone_id: string; reason: string }[];
    resources_used: number;
  };
  recon: {
    proposals: { zone_id: string; zone_name: string; drone_id: string | null; callsign: string | null;
                 info_value: number; need: number; confidence_pct: number;
                 expected_confidence_gain_pct: number; reasons: string[]; rule: string }[];
    unflyable: { zone_id: string; reason: string }[];
    candidates: number;
  };
  counts: { zones: number; tasks: number; assigned: number; unassigned: number; recon_proposals: number };
}
```

---

## 5. Time budgets

**One day (P0 only):** T1 → T2 → T3 → T4. This alone changes the project from "dashboard" to "system".
**Three days:** add T5, T6, T7 (live feed + the differentiator made visible).
**Full week:** add T8, T9, T10.

---

## 6. Cut list — do not build

Sentinel/GlOFAAS/IMD/Bhuvan pipelines · PostGIS migration · 3-D swarm animation · CV survivor detection · real authentication · cyclone/landslide scope · any new dependency.

---

## 7. Definition of done

- [ ] `python -m app.engine.tests.test_engine` → 28 passed
- [ ] `/api/engine/derived` populated on boot, before any user action
- [ ] No mission in the UI references a resource already `DEPLOYED`
- [ ] A recon proposal appears without any click
- [ ] After a flight, confidence rises and the proposal disappears — with an audit line explaining it
- [ ] Blocking a route changes the ranking **and** the assignment, both visible in the audit trail
- [ ] Seeded vs LIVE is visually distinguishable on every input row
- [ ] `GET /api/situation` shape unchanged; login/timer/approval/audit all still work
- [ ] README lists what is not implemented, without hedging
