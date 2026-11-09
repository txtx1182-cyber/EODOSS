# EODOSS Implementation Plan — 18 Phases

## Delivery principle

Each phase must create a visible, recordable outcome and update the shared situation model. Build a stable flood-response simulation before attempting real integrations.

| Phase | Deliverable | Demonstrable result |
|---|---|---|
| 1 | Foundation | Project structure, tactical design tokens, demo-mode label, role definitions. |
| 2 | Authority login | Two-step simulated authority login and protected application entry. |
| 3 | Dashboard shell | Tactical EOC layout: map canvas, side racks, decision queue, event log. |
| 4 | Shared data model | Incident, zones, routes, shelters, resources, drones, missions, alerts, audit events. |
| 5 | Flood scenario | Seeded Guwahati scenario with credible locations, resources, and time-stamped baseline data. |
| 6 | Prediction inputs | Weather, river sensor, and LISS-4 imagery records with source/freshness/confidence. |
| 7 | Risk calculation | Transparent simulated flood-risk and uncertainty score per zone. |
| 8 | Local alert review | Potential-disaster alert, evidence bundle, five-minute timer, confirm/reject/monitor actions. |
| 9 | District escalation | Timeout path and district-authority escalation briefing. |
| 10 | E-RESQ | Rescue targets, teams, boats, priority zones, routes, and shelter assignment. |
| 11 | E-SUPP | Food, medicine, doctors, NGOs, shelter capacity, stock, and delivery planning. |
| 12 | Mutual aid | Shortage thresholds and authority-approved nearby-city support requests. |
| 13 | Drone registry | E-SCOUT/E-CARGO stations, availability, battery, payload, location, status. |
| 14 | Reconnaissance | E-SCOUT task generation and simulated location/route/obstacle observations. |
| 15 | Cargo delivery | E-CARGO dispatch and supply-state updates for shelters, teams, or isolated areas. |
| 16 | Orchestration | Event routing, recommendations, allocation checks, approval gates, conflict prevention, replanning. |
| 17 | Live synchronization | Shared event updates, activity log, source/freshness indicators, mission audit trail. |
| 18 | Submission hardening | Resettable scenarios, edge-case tests, UI refinement, and 3–5 minute video rehearsal. |

## Primary demo path

```text
Login → Load scenario → Detect high risk → Local authority review
→ Confirm flood → Activate E-RESQ and E-SUPP → E-SCOUT reconnaissance
→ Replan routes/priority → Approve rescue or supply mission → Detect shortage
→ Approve mutual-aid request → Show synchronized event stream
```
