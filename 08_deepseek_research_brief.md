# EODOSS Deep Research Brief

Use this document as context when asking DeepSeek or another research assistant for architecture, algorithms, implementation advice, data schemas, tactical UI critique, scenario realism, or safe research directions.

## Project

EODOSS means Emergency Operations and Disaster Orchestration Support System. It is a hackathon simulation-first web application for flood-disaster decision support. It must be human-supervised and must not be described as an operational autonomous emergency system.

## Core idea

The system maintains a localized shared situation model. It tracks what is known, where it came from, when it was observed, how fresh it is, how confident the system is, and whether sources conflict. This information state drives both priority ranking and targeted reconnaissance.

## Three backend layers

### Prediction

Inputs: weather updates, riverbank sensor readings, LISS-4 satellite imagery.

Outputs: predicted flood severity/extent, risk by zone, hazard trend, uncertainty, and priority-zone candidates.

### Calculation and planning

Inputs: doctors, medicines, food, necessities, safe areas/shelters, rescue boats, helipads, drone stations, routes, live drone findings, priority zones, and resource availability.

Outputs: rescue priority, shelter allocation, doctor/NGO routes, supply plans, resource sufficiency, shortage warnings, and an overall action plan.

### Execution

Inputs: authority-approved plan plus available teams, boats, drones, doctors, NGOs, shelters, supplies, routes, and live observations.

Outputs: live mission assignments, rescue/supply status, reconnaissance findings, route updates, and feedback for replanning.

## Human authorization workflow

1. System detects sustained possible flood risk.
2. Local authority receives an evidence package and five-minute acknowledgement timer.
3. Authority confirms disaster, rejects/continues monitoring, or requests verification.
4. If no local response and risk stays high, escalate to district authority.
5. Confirmed disaster activates E-RESQ and E-SUPP planning.
6. Consequential rescue, major supply, and inter-city support actions require authority approval.

## Operations modules

### E-RESQ

Coordinates rescue teams, boats, rescue targets, priority zones, routes, and shelter destinations. It uses E-SCOUT drone observations to verify routes and possible people/animal locations.

### E-SUPP

Coordinates food, water, medicine, doctors, NGOs, shelter capacity, stock, E-CARGO deliveries, shortages, and mutual aid. If a region lacks support, it prepares a nearby-city/district request for authority approval.

### E-SWARM

- E-SCOUT: reconnaissance, route verification, flood/obstacle observation, possible people/animal detection, and mesh relay.
- E-CARGO: approved emergency food/medicine/essential delivery.

All modules exchange updates through a shared live event/state model.

## Orchestration requirements

The orchestrator must route events, update shared state, calculate priorities, generate tasks, allocate resources, enforce approvals, prevent duplicate/conflicting assignments, and replan when facts change. Recommendations must be explainable with evidence, freshness, confidence, urgency, assigned resource, and approval state.

## Prior-art and claim constraints

Do not claim that EODOSS invents forecasting, satellite mapping, drone reconnaissance, swarm coordination, emergency dispatch, or operational dashboards. Existing systems/research cover these areas.

The possible contribution is evaluating a unified information-state representation—freshness, provenance, confidence, uncertainty, and conflict status—that affects both response prioritization and the decision to acquire more information in an Indian multi-hazard context.

Do not claim an operational autonomous drone fleet, delay-free communications, real NDMA/FEMA/NATO integration, legal novelty, or field deployment readiness.

## Frontend direction

Design a dense dark tactical emergency-operations GIS console, not generic SaaS or cyberpunk AI UI.

- Background `#0B0F14`; panels `#121820`; dividers `#263244`; text `#E2E8F0`.
- Severe `#DC2626`; caution `#D97706`; safe `#15803D`; uncertainty `#EAB308`; conflict `#F97316`.
- EOC gateway: white square; E-SCOUT: blue diamond `#0284C7`; E-CARGO: orange hex `#EA580C`.
- Strong mesh: green solid line; relay: amber dashed line; disconnected: red `NO MESH UPLINK` state.
- Use Inter/IBM Plex Sans plus JetBrains Mono/IBM Plex Mono for telemetry.
- Sharp 1px borders and dense operational tables. No glassmorphism, gradients, neon glow, bubbly cards, marketing language, or decorative illustrations.

## Recommended research questions

1. What simple, explainable risk and uncertainty scoring approach can work in a hackathon flood simulation?
2. What event schema and state-machine design best supports synchronized authority, rescue, supply, and drone updates?
3. What resource-allocation heuristic can assign teams, boats, doctors, cargo drones, and supplies while handling priority, distance, capacity, and route access?
4. What transparent rules should trigger drone reconnaissance instead of immediate rescue/supply dispatch?
5. How should shortage detection and nearby-city mutual-aid requests be modeled in a simulation?
6. What sample GeoJSON-based Guwahati/Assam flood scenario can be plausible without claiming live operational data?
7. How can MapLibre/Leaflet implement tactical zone fills, hatching, nodes, mesh links, and dynamic route statuses cleanly?
8. What FastAPI + React + WebSocket/SSE architecture is simplest for a reliable demo?

## Desired DeepSeek output

Ask for practical, concise, implementation-oriented recommendations: data schema, state machines, algorithms/pseudocode, React/FastAPI folder structure, seed-data examples, and tactical UI components. Clearly label every assumption and avoid inventing real agency integrations or unsafe autonomous behavior.
