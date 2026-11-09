# EODOSS Product Requirements and System Decisions

**Version:** 0.1  
**Status:** Working specification for hackathon application development  
**Product:** Emergency Operations and Disaster Orchestration Support System (EODOSS)

## 1. Product purpose

EODOSS is a human-supervised disaster intelligence and operations platform for flood response. It combines prediction, operational calculation, and authorized execution so that local and district authorities can detect an emerging disaster, verify the evidence, prioritize response, coordinate rescue and logistics, and continuously update the plan from live field data.

The central operating loop is:

```text
Observe → Predict → Calculate → Recommend → Authorize → Execute → Update → Replan
```

The first demonstration scenario is a flood response workflow. The application is simulation-first and must clearly distinguish simulation/training data from real operational data.

## 2. Backend architecture

The backend is divided into three connected layers.

### 2.1 Prediction layer

**Purpose:** detect and forecast flood conditions, likely flood extent, severity, and affected zones.

**Inputs**

- Weather updates
- Riverbank sensor readings
- LISS-4 satellite imagery

**Expected outputs**

- Flood likelihood and severity
- Predicted flood extent / affected-area estimate
- Hazard trend: rising, stable, or reducing
- Zone-level risk score
- Confidence and freshness of the evidence
- Potential priority zones for authority review

### 2.2 Calculation and planning layer

**Purpose:** convert the current disaster picture into a practical resource and response plan.

**Inputs**

- Current doctor availability
- Current medicine and medical-support availability
- Current food and essential-supply availability
- Current safe areas / shelter zones within range
- Current rescue boats
- Available helipads
- Drone stations near the affected area
- Priority zones produced by the prediction and situation layers
- Route availability, accessibility, and confidence
- Live drone-footage findings

**Expected outputs**

- Priority ranking of zones, people, rescue needs, and shelters
- Resource sufficiency and shortage calculation per area/shelter
- Recommended safe shelter assignments
- Recommended routes for rescue teams, doctors, NGOs, supplies, and drones
- Recommended rescue, reconnaissance, medical, supply, and support missions
- Total action plan for authority review

### 2.3 Execution layer

**Purpose:** coordinate approved operational missions and return live field feedback to the shared situation model.

**Inputs**

- Authority-approved action plan
- Available teams, boats, drones, doctors, NGOs, shelters, and supplies
- Live drone footage and drone telemetry
- Latest route condition and priority-zone data

**Expected outputs**

- Mission assignments and live mission status
- Reconnaissance observations
- Verified / suspected people or animal locations
- Drone-confirmed accessible, blocked, or uncertain routes
- Delivery status for medical and food supplies
- Rescue-team and resource status
- New information for recalculation and replanning

## 3. Human authorization and disaster escalation

EODOSS must retain human authority for consequential operational decisions.

### 3.1 Flood or disaster detection protocol

1. The prediction layer detects a possible flood event or sustained high flood risk.
2. EODOSS alerts the designated local authority with an evidence package.
3. The dashboard starts a visible 5-minute acknowledgement timer and alert state.
4. The authority reviews weather data, riverbank sensors, LISS-4 imagery, predicted risk, and available field/drone evidence.
5. The authority can confirm the disaster, reject it and continue monitoring, or request further verification.
6. If the local authority does not acknowledge within five minutes and the risk remains above the escalation threshold, EODOSS sends the evidence package to the district-level authority for confirmation.
7. Every alert, acknowledgement, decision, escalation, and authorization is timestamped and auditable.

### 3.2 Safety and authority rules

The system may automatically:

- Monitor and ingest data
- Calculate risk, uncertainty, shortages, and routes
- Notify relevant users and modules
- Recommend actions
- Request or plan low-risk reconnaissance within configured safety rules
- Draft support requests

The system must require authorized approval for:

- Confirming a disaster incident
- High-impact rescue or evacuation deployment
- Major supply dispatches
- Inter-city or inter-district support requests
- Material changes to an approved operational plan

An acknowledgement is not equivalent to a disaster confirmation.

## 4. E-RESQ rescue coordination

E-RESQ activates after an authorized disaster confirmation.

### Responsibilities

- Manage rescue-team availability, assignment, and status
- Plan and replan routes for rescue teams and rescue boats
- Rank rescue targets using priority zones and verified incident data
- Track rescued people and assign / recommend shelter zones
- Coordinate reconnaissance requests with E-SWARM
- Receive people, animal, obstacle, route, and access observations from drones
- Use drone-confirmed routes where satellite imagery is outdated, blocked, or unable to show ground conditions

### E-RESQ outputs

- Rescue mission recommendations and assignments
- Rescue-team routes and alternate routes
- Rescue target location, confidence, and status
- Priority-zone updates
- Shelter destination recommendations
- Mission state: proposed, awaiting approval, approved, active, completed, failed, or cancelled

## 5. E-SUPP logistics and support coordination

E-SUPP activates after an authorized disaster confirmation.

### Inputs

- Food, water, medicines, first-aid kits, blankets, and essential supplies
- Stock quantity, storage location, expiry information where relevant, and dispatch state
- Shelter capacity, current occupancy, medical needs, and expected consumption
- Doctors, medical teams, NGOs, volunteers, ambulances, and vehicles
- Drone-station availability and E-CARGO drone status
- Drone payload limit, battery, position, and safe delivery points
- Confirmed / likely accessible routes
- Nearby city and district support capacity

### Responsibilities

- Calculate shelter-wise needs versus available supply
- Plan doctor and NGO routes to high-need shelters
- Assign E-CARGO drones to food, medicine, and essential-supply deliveries
- Prioritize supply support for rescuers, shelters, stranded people, and medical emergencies
- Monitor low-stock conditions by region and item
- Create nearby-city support request drafts when local capacity is insufficient

### Shortage and mutual-aid workflow

1. E-SUPP detects that a region or shelter has insufficient food, medicine, necessities, doctors, or other support.
2. It identifies possible nearby cities/districts able to provide support.
3. It prepares a request containing the item/service, quantity, affected location, urgency, evidence, recommended source, and proposed route.
4. An authorized officer reviews and approves the request.
5. The approved request is sent and the fulfilment status is tracked in EODOSS.

## 6. E-SWARM and drone operations

E-SWARM is the specialized multi-agent field coordination layer.

### Drone roles

- **E-SCOUT:** reconnaissance, observation, route verification, people/animal detection, flood-depth and obstacle assessment.
- **E-CARGO:** food, medicine, and essential-supply delivery to rescuers, shelters, and people in need, subject to safety and authority rules.

### Reconnaissance workflow

1. The orchestrator identifies an important information gap, uncertain route, or priority zone.
2. E-SCOUT receives an authorized reconnaissance task.
3. The drone returns footage, GPS location, timestamp, confidence, route condition, and relevant observations.
4. The shared situation model updates immediately.
5. E-RESQ uses confirmed locations and route information for rescue planning.
6. E-SUPP uses the same information for logistics and delivery planning.

### Detection rules

Drone detection of a person or animal must create a **possible incident** with video, GPS coordinate, timestamp, and confidence. It must not be represented as a confirmed rescue target until verified by a human operator or defined verification protocol.

## 7. Orchestration layer

The orchestration layer is the coordination brain. It does not replace E-RESQ or E-SUPP; it keeps the modules aligned, turns updates into tasks, checks constraints, and maintains the total action plan.

### Core responsibilities

1. **Event routing** — distribute significant updates to the authority, E-RESQ, E-SUPP, and relevant field agents.
2. **Shared situation state** — maintain the current incident picture across hazard, people, routes, shelters, supplies, teams, and drones.
3. **Priority calculation** — combine flood severity, people at risk, route access, shelter capacity, supply shortage, and uncertainty.
4. **Task generation** — create recommended rescue, reconnaissance, supply, medical, and support tasks.
5. **Resource allocation** — recommend the nearest capable available resource while preventing duplicate assignments.
6. **Approval and safety gate** — determine whether a task can be prepared automatically or requires human authority.
7. **Conflict resolution** — detect conflicts such as two teams assigned to the same rescue target or a drone planned for overlapping missions.
8. **Replanning** — update task assignments when a route closes, a new person is detected, a shelter fills, or stock falls below minimum levels.
9. **Explanation and auditability** — record why each recommendation was made, its evidence, confidence, urgency, assigned resource, and approval status.

### Example orchestration event

```text
Drone detects possible stranded people in Zone F
→ Event added to shared situation model
→ E-RESQ receives rescue recommendation
→ E-SUPP assesses medical, food, and shelter impact
→ Authority receives one combined decision brief
→ On approval, resources are assigned and mission progress is tracked
→ Results update the shared state and the plan is recalculated
```

## 8. Live communication and shared state

Authority Command, E-RESQ, and E-SUPP must communicate through one shared live operational state. They must not function as isolated dashboards.

### Events shared live

- Authority decisions, approvals, pauses, and plan changes
- Flood alerts, risk changes, and evidence updates
- Rescue-team, boat, drone, doctor, NGO, and vehicle assignment/status changes
- Person/animal detections and verification results
- Route availability and obstruction updates
- Shelter capacity and occupancy changes
- Food, medicine, and supply stock changes
- Shortage alerts and mutual-aid-request status
- Mission state transitions and failures

### Required shared-state fields

- Incident status and authority decisions
- Priority zones and current risk level
- Rescue targets and rescued-person status
- Shelter capacity, occupancy, and needs
- Inventory and shortages
- Team, vehicle, boat, drone, doctor, and NGO location/status
- Route status, source, freshness, and confidence
- Mission status: proposed, approved, active, completed, failed, or cancelled
- Timestamp, source, confidence, and responsible operator for every material update

## 9. Authority frontend concept

The frontend must feel like a credible civic emergency-operations console rather than a generic AI dashboard.

### Design principles

- Authority decisions and evidence take precedence over decorative data cards.
- The main visual element is an operational map, not charts or neon widgets.
- Critical red is used only for genuine urgent incidents or required decisions.
- Every important recommendation shows evidence freshness, source, confidence, and last-verification time.
- The UI must distinguish simulated/training data from verified operational data.
- Avoid excessive pill chips, gradients, glowing effects, generic circular meters, and futuristic HUD styling.

### Visual language

| Element | Direction |
|---|---|
| Overall style | Civic operations console / emergency control room |
| Background | Warm off-white `#F4F1EA` |
| Panels | Near-white `#FFFEFA` |
| Main text | Charcoal `#1D252A` |
| Map land | Muted terrain green `#D7DFD4` |
| Map water | Soft blue `#9BC3CF` |
| Primary action | Government-document blue `#2458A6` |
| Warning | Ochre `#C98826` |
| Critical | Restrained red `#B83D38` |
| Confirmed / safe | Muted green `#3F7965` |
| Typography | Inter, IBM Plex Sans, or Source Sans 3 |
| Layout | Simple tables, briefing panels, meaningful whitespace, 4–6px panel radii |

### Authority login page

The login view should be an official secure-access terminal, not a startup landing page.

```text
EODOSS
Emergency Operations and Disaster Orchestration Support System

Authorized Access
Regional disaster-response command

Authority identifier
Password

[ Sign in ]

System status: Operational
Data environment: Training simulation
```

### Authority dashboard information hierarchy

1. **Top status bar:** incident identity, current status, update time, active authority.
2. **Main map:** flood extent, priority zones, shelters, teams, boats, drones, and route status.
3. **Decision brief:** urgent alert / recommended decision, evidence, confidence, and confirmation control.
4. **Live field notes:** concise chronological operational events.
5. **Operational views:** E-RESQ, E-SUPP, E-SWARM, resource status, alerts, and audit log.

### Flood-confirmation decision card

```text
POTENTIAL FLOOD EVENT DETECTED

Location: Zone F, Guwahati
Risk level: Severe
Confidence: 88%
Evidence: river sensor, weather update, LISS-4 imagery, drone evidence
Local authority response window: 04:32 remaining

[ Review evidence ] [ Continue monitoring ] [ Confirm disaster ]
```

If the response window expires while the risk remains above the escalation threshold, the application displays and logs escalation to district authority.

## 10. Hackathon demo story

1. A weather update, river sensor, and satellite evidence create a high flood-risk alert.
2. The local authority receives the five-minute confirmation decision card.
3. The authority confirms the disaster.
4. E-RESQ and E-SUPP become active, and the shared map shows the first total action plan.
5. E-SCOUT verifies a route or detects possible stranded people.
6. EODOSS updates the priority zone, rescue route, supply requirements, and shelter planning live.
7. The authority approves a rescue mission or an E-CARGO supply mission.
8. E-SUPP identifies a shortage and presents an inter-city support request for approval.
9. The activity log demonstrates that Authority, E-RESQ, and E-SUPP stay synchronized.

## 11. Scope boundaries for the first demo

- Build a realistic simulation with clearly labeled example data.
- Use human approval for consequential actions.
- Demonstrate recommendations, missions, live updates, and replanning instead of claiming live emergency deployment.
- Treat satellite, sensor, and drone data as modeled inputs until valid real-world integrations and safety checks exist.
- Preserve source, timestamp, freshness, confidence, and verification state for all significant observations.

## 12. Eighteen-phase application build plan

The first build is a hackathon-ready simulation. Each phase must have a visible outcome that can be demonstrated before moving to the next phase.

| Phase | Area | Build objective | Visible demo outcome |
|---|---|---|---|
| 1 | Product foundation | Set up the application structure, design tokens, role definitions, and simulated-data label. | Application opens with EODOSS identity and “Training simulation” context. |
| 2 | Authority authentication | Create authority sign-in, session state, and protected application entry. | Authority signs in to access the command dashboard. |
| 3 | Authority dashboard shell | Build the civic emergency-operations layout: top status bar, navigation, map workspace, decision brief, and event feed. | A credible control-room dashboard appears before live scenario data is added. |
| 4 | Shared situation model | Define the core data structures for incidents, observations, zones, routes, shelters, resources, teams, drones, missions, alerts, and audit records. | A single shared incident state can be inspected and updated by all modules. |
| 5 | Simulation scenario data | Create a Guwahati flood scenario with zones, shelters, teams, boats, stock, doctors, NGOs, drone stations, routes, and time-stamped baseline observations. | The dashboard can load a meaningful, coherent flood scenario without external APIs. |
| 6 | Prediction inputs | Add weather updates, riverbank sensor readings, and LISS-4 satellite-imagery records to the scenario. | The system shows the source, timestamp, freshness, and confidence for each prediction input. |
| 7 | Flood prediction | Implement a transparent simulated flood-risk calculation using weather, sensor, and imagery evidence. | Zone risk changes to low, elevated, severe, or critical with an explanation of why. |
| 8 | Alert and local-authority review | Create the potential-disaster alert, evidence package, five-minute acknowledgement timer, confirm/reject/monitor actions, and audit log. | Authority can review evidence and confirm or reject a flood incident. |
| 9 | District escalation | Add the no-response path: when local acknowledgement expires while risk stays high, prepare district-authority escalation. | Demo can show a timed escalation with the relevant evidence package and status. |
| 10 | E-RESQ planning | Build rescue-team, boat, rescue-target, priority-zone, route, and shelter-assignment logic. | Confirming the disaster creates a ranked rescue plan with proposed assignments. |
| 11 | E-SUPP planning | Build food, water, medicine, doctor, NGO, shelter-capacity, stock, and delivery planning logic. | Dashboard shows shelter-wise need, available stock, doctor routing, and recommended supply tasks. |
| 12 | Shortage and mutual aid | Add minimum-stock thresholds, shortage detection, nearby-city support options, and authority-approved request drafts. | A shortage produces a reviewable request for food, medicine, necessities, or doctors. |
| 13 | E-SWARM and drone registry | Model E-SCOUT and E-CARGO drones with station, availability, battery, payload, position, and mission state. | Authority can see available drones and their readiness at each station. |
| 14 | Reconnaissance workflow | Build E-SCOUT mission generation and simulated drone observations: possible people/animal detection, route status, flood depth, obstacles, and evidence confidence. | A reconnaissance mission updates the map and creates a verification-ready incident record. |
| 15 | E-CARGO workflow | Build supply-delivery tasks for E-CARGO based on priority, payload, battery, route, and safe delivery point. | An approved E-CARGO mission changes supply status for a rescue team, shelter, or isolated area. |
| 16 | Orchestration engine | Implement event routing, task generation, resource-allocation checks, approval gates, duplicate/conflict prevention, and replanning rules. | One new event, such as a blocked route or survivor detection, updates E-RESQ, E-SUPP, and the authority decision brief. |
| 17 | Live communication and audit | Add real-time state propagation, activity feed, source/freshness markers, mission-state updates, and full action log. | All three modules show synchronized updates when any team or group changes status. |
| 18 | Demo hardening and submission | Test the full happy path and failure paths, refine the UI, prepare seeded reset scenarios, and rehearse the recording script. | A stable 3–5 minute video can show detection, confirmation, activation, reconnaissance, rescue/supply planning, shortage escalation, and replanning. |

### Recommended build order inside the demo

```text
Sign in
→ Load flood simulation
→ Predict high risk
→ Local authority alert
→ Confirm disaster
→ Activate E-RESQ and E-SUPP
→ Send E-SCOUT reconnaissance
→ Update rescue route and priority zone
→ Assign E-CARGO / doctor / rescue support
→ Detect shortage
→ Approve nearby-city support request
→ Show all modules updated through the shared live state
```

### Phase completion rule

A phase is complete only when its scenario can be demonstrated visibly, its output updates the shared situation model, and its relevant authority approval / audit behavior is present. Do not add real deployment claims, autonomous rescue claims, or external emergency messaging until the simulation workflow is stable and independently validated.
