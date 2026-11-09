# EODOSS 2.0
**Emergency Operations and Disaster Orchestration Support System**

EODOSS is a simulation-first, human-supervised flood-disaster operations platform built strictly in accordance with the 18-phase master build specification pack. It converts multi-sensor hydrological observations into risk predictions, resource plans, authorized missions, and continuous live replanning.

---

## Architecture Overview

```text
Weather (IMD Radar) + River Gauges (CWC) + LISS-4 Imagery + Drone Telemetry (E-SCOUT)
                                    ↓
                        Observation Ingestion Layer
                                    ↓
                  Shared Situation Model & Event Stream
                        ↓                         ↓
               Prediction Layer             Orchestration Layer
                        ↓                         ↓
                 Risk & Uncertainty        Tasks, Conflicts, Approvals,
                      by Zone                 Allocations, Replanning
                        ↓                         ↓
                 Calculation and Planning Layer (E-RESQ & E-SUPP)
                        ↓                         ↓
                  E-RESQ Operations         E-SUPP Logistics
                  (Amphibious Boats)        (Medical & Supplies)
                        ↓                         ↓
                  E-SWARM Reconnaissance & Cargo Air-Drops
                        ↓                         ↓
                 Feedback Loop to Shared Situation Model
```

---

## Visual & Tactical Design Tokens

- **Console Background:** `#0B0F14`
- **Panel Surface:** `#121820`
- **Elevated/Hover Rows:** `#18202C`
- **Hairline Dividers:** `#263244`
- **Primary Text:** `#E2E8F0`
- **Secondary Labels:** `#94A3B8`
- **Severe Hazard / Critical:** `#DC2626`
- **Caution / Elevated:** `#D97706`
- **Verified Safe:** `#15803D`
- **Uncertainty / Hatching:** `#EAB308`
- **Conflict / Comms Blackout:** `#F97316`
- **E-SCOUT Recon Drone:** `#0284C7` (Diamond)
- **E-CARGO Delivery Drone:** `#EA580C` (Hexagon)
- **5.8GHz Tactical Mesh:** `#10B981` (Solid), `#F59E0B` (Relay), `#EF4444` (Partitioned `[NO MESH UPLINK]`)

---

## Quick Start / Running the Application

### Option A: Run Full-Stack FastAPI Server (Serves API + WebSocket + Built Tactical UI)
```powershell
# In backend directory:
cd backend
python -m uvicorn app.main:app --port 8000
```
Then navigate to: **`http://localhost:8000`**

### Option B: Run Vite Frontend in Live Development Mode
```powershell
# In frontend directory:
cd frontend
npm run dev
```
Then navigate to the Vite local dev URL (e.g. `http://localhost:5173`).

---

## 3–5 Minute Hackathon Demo Story

1. **Restricted Authority Login (Phase 2):**
   - Click `[DEV/JUDGE DEMO CREDENTIAL] ONE-CLICK BYPASS` or enter `demo@eodoss.gov.in` / `eodoss2026` + Dispatch Code `742918`.
   - The operational blackout lifts and mounts the tactical EOC GIS console.

2. **Step 1: Hydrological Ingestion & Detection (Phases 6 & 7):**
   - Review incoming river gauge (Brahmaputra 50.85m), Doppler radar (42.5mm/hr), and LISS-4 imagery (+340ha delta).
   - The 5-minute Local Authority review countdown timer is actively ticking.

3. **Step 2: Local Authority Emergency Confirmation (Phase 8):**
   - Click **`CONFIRM DISASTER & ACTIVATE DIRECTIVES`** in the Decision Brief rack.
   - Transitions alert lifecycle to `CONFIRMED // ACTIVE_RESPONSE` and activates E-RESQ and E-SUPP operational directives.

4. **Step 3: E-SCOUT Aerial Reconnaissance (Phase 14):**
   - Click **`AUTHORIZE MISSION EXECUTION`** on Mission `MSN-REC-01`.
   - E-SCOUT-01 launches to Zone F Chandrapur.
   - Real-time telemetric discovery: Route `RT-03` is verified **BLOCKED** (washed out culvert), and Incident `INC-01` is upgraded to **VERIFIED_TARGET** (14 stranded villagers on school rooftop).

5. **Step 4: Orchestrated Replanning & Boat Rescue (Phases 10 & 16):**
   - The orchestrator detects road impassability and recalculates: generates amphibious river rescue `MSN-RES-01` (SDRF Boat Unit 03, NDRF 01).
   - Click **`AUTHORIZE MISSION EXECUTION`** to deploy the amphibious boat convoy.

6. **Step 5: E-CARGO Precision Trauma Air-Drop (Phase 15):**
   - Click **`EXECUTE PRECISION AIR-DROP`** on Mission `MSN-CARGO-01`.
   - E-CARGO-01 delivers 8.5kg of trauma packs, pediatric ORS, and water purification units to the isolated school rooftop prior to boat arrival.

7. **Step 6: E-SUPP Shortage Detection & Mutual Aid Requisition (Phases 11 & 12):**
   - Critical shortage threshold breached for ORS and emergency medicine at GMC District Stores.
   - Click **`TRANSMIT INTER-DISTRICT REQUEST`** on Request `REQ-MA-001`.
   - Inter-district logistics convoy requisition authorized and transmitted to Tezpur Regional Medical Depot via NH-15.

8. **Full Synchronization & Audit Trail (Phase 17):**
   - Switch between **`E-RESQ`**, **`E-SUPP`**, **`E-SWARM`**, **`SENSOR FEEDS`**, and **`AUDIT TRAIL`** to inspect the synchronized situation model.

