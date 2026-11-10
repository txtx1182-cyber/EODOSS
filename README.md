# EODOSS 2.0
**Emergency Operations and Disaster Orchestration Support System**

EODOSS provides rule-based decision support over a seeded scenario for flood-disaster operations. Built with FastAPI and Pydantic on the backend, React, TypeScript, and Vite on the frontend, and Leaflet for spatial situational awareness.

Scenario Event: `Brahmaputra Flash Surge & Urban Inundation — Guwahati Metro`

---

## System Capability Matrix

| Implemented | Simulated | Not implemented |
| :--- | :--- | :--- |
| Need scoring algorithm (exposure, severity, trend, isolation) | Seed scenario geography (Guwahati Metro 6 zones) | Sentinel-1 SAR / NISAR raw ingest pipeline |
| Evidence confidence and staleness decay calculation | CWC Pandu river gauge baseline reading (50.85m) | Private CWC / IMD production gateway |
| Information value thresholding for reconnaissance | Doppler radar baseline intensity (42.5 mm/h) | PostGIS spatial database storage |
| Greedy capacity-constrained resource allocation | LISS-4 optical imagery inundation delta (+340 ha) | Real-world SMS / CAP alert gateway |
| Worst-case ETA calculation with access penalty | Drone flight execution physics and live video | Computer vision survivor detection on drone video |
| 2×2 Decision Quadrant (Dispatch / Verify / Recon / Monitor) | Field rescue boat and team GPS positions | Multi-tenant production authentication (uses mock roles) |
| Evidence chips with confidence breakdown | Mutual aid external response state machine | Autonomous drone swarm mesh networking |
| Live Open-Meteo weather REST API adapter | | Automatic sensor calibration |
| Recompute lifecycle and state diffing on mutations | | |
| WebSocket situation state broadcast (`/ws/live`) | | |
| Scale benchmark comparison (`/api/engine/simulation`) | | |
| 5-minute local authority review countdown timer | | |
| Local review confirmation and district escalation gate | | |
| Immutable audit trail with standard event taxonomy | | |

---

## Data Provenance: Computed vs Constants

### Computed Numbers (Dynamic Engine)
- **Zone Need Score (`need`):** Computed as a weighted sum of four sub-scores: population exposure (0.35), flood severity (0.35), water level trend (0.15), and corridor isolation (0.15).
- **Zone Confidence (`confidence_pct`):** Computed from active sensor inputs evaluated against staleness half-lives, sensor recency, source agreement, and input completeness.
- **Uncertainty (`uncertainty_pct`):** Exact mathematical complement `100 - confidence_pct`.
- **Information Value (`info_value`):** Defined as `need * (1 - confidence)`, quantifying the operational value of sending aerial reconnaissance.
- **Corridor Accessibility (`access`):** Calculated from nearest road corridor status (Accessible: 1.0, Caution: 0.6, Replan: 0.7, Blocked: 0.05).
- **Rescue Allocations & ETAs:** Tasks generated from incidents; units assigned up to capacity; worst-case arrival time computed based on haversine distance and corridor access factors.
- **Scale Benchmark Comparisons:** Need-weighted ETA improvement and coverage delta percentage points evaluated across deterministic synthetic scenes.

### Constants (Seeded Scenario Baseline)
- **Zone Boundaries & Centers:** 6 zones across Guwahati Metro (Panbazar, Bharalumukh, Jalukbari, Dispur, Noonmati, Chandrapur).
- **Baseline Populations:** Initial exposed population numbers per zone (e.g., 22,000 for Zone F).
- **Seeded Sensor Inputs:** Baseline telemetry values for radar, river gauges, and satellite extent.
- **Fleet Roster & Base Locations:** Roster of 5 rescue boats, 3 rescue teams, 2 ambulances, and 2 drones.
- **Review Timer Duration:** 300 seconds (5 minutes) acknowledgement window.

---

## Architecture Overview

```text
Open-Meteo Live API / Seed Telemetry
                ↓
    Observation Ingestion Layer
                ↓
  Shared Situation Model (FastAPI State)
        ↓                     ↓
Decision Engine Scoring     Resource Allocation & Recon
(Need, Confidence, Access)  (Greedy Matching, ETA, Proposals)
        ↓                     ↓
  Derived State Cache & Audit Trail Diffing
                ↓
WebSocket Broadcast (/ws/live) & REST API (/api/engine/derived)
                ↓
React + TypeScript Tactical EOC Console (Decision Quadrant & Evidence Chips)
```

---

## Quick Start / Running the Application

### 1. Run Full-Stack FastAPI Server
```powershell
cd backend
python -m uvicorn app.main:app --port 8000
```
API endpoints and static frontend: `http://localhost:8000`

### 2. Run Vite Frontend in Development Mode
```powershell
cd frontend
npm run dev
```
Development interface: `http://localhost:5173`

### 3. Run Test Suite
```powershell
# In backend directory:
python -m app.engine.tests.test_engine
python -m app.engine.simulation
```

---

## Key API Endpoints

- `GET /api/situation`: Canonical situation model (frozen schema).
- `GET /api/engine/derived`: Real-time engine derived state (scores, allocation, recon proposals).
- `POST /api/engine/recompute`: Trigger recompute and receive state diff.
- `GET /api/engine/simulation?seed=7`: Multi-agent headless benchmark comparison.
- `GET /api/ingest/feeds`: Feed registry status.
- `POST /api/ingest/refresh`: Trigger live ingest fetch (e.g., Open-Meteo).
- `POST /api/missions/recon`: Dispatch drone reconnaissance based on active proposal.
- `POST /api/situation/reset`: Reset situation to scenario initial state.
- `WS /ws/live`: Real-time WebSocket synchronization stream.
