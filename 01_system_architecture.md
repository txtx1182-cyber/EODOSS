# EODOSS System Architecture

## Purpose

EODOSS is a simulation-first, human-supervised flood-disaster operations platform. It converts live or simulated observations into risk predictions, resource plans, authorized missions, and continuous replanning.

## System flow

```text
Weather + River Sensors + LISS-4 Imagery + Field Reports + Drone Telemetry
                                ↓
                    Observation Ingestion Layer
                                ↓
              Shared Situation Model and Event Stream
                    ↓                         ↓
           Prediction Layer             Orchestration Layer
                    ↓                         ↓
             Risk and uncertainty       Tasks, conflicts, approvals,
                  by zone                allocations, replanning
                    ↓                         ↓
             Calculation and planning layer
                    ↓                         ↓
       E-RESQ rescue operations     E-SUPP logistics operations
                    ↓                         ↓
              E-SWARM reconnaissance and cargo missions
                                ↓
             Feedback to the shared situation model
```

## Major modules

### 1. Authentication and authority control

- Restricted login before any operational data is mounted or fetched.
- Two steps: credentials, then six-digit dispatch verification code.
- Demo-only bypass: `[DEV/JUDGE DEMO CREDENTIAL]`.
- Roles: Local Authority, District Authority, E-RESQ Operator, E-SUPP Operator, Viewer/Auditor.

### 2. Observation ingestion

Each observation requires:

- `id`, `source_type`, `source_id`, `timestamp`, `ingested_at`
- geographic point/area, zone reference, confidence, freshness
- verification state: unverified, verified, disputed, stale
- relevant payload: weather, water level, imagery interpretation, report, video finding, route condition, or resource state

### 3. Shared situation model

Central state visible to all authorized modules:

- incident lifecycle and authority decisions
- risk/uncertainty by zone
- routes and route confidence
- shelters, occupancy, needs, and capacity
- people/animal incident candidates and verification state
- teams, boats, doctors, NGOs, drones, stock, and mission status

### 4. Prediction layer

Inputs: weather update, riverbank sensors, LISS-4 satellite imagery.

Outputs: predicted flood severity, hazard trend, affected extent, risk score, uncertainty score, and priority-zone candidates.

### 5. Calculation and planning layer

Inputs: current doctors, medicines, food, safe areas/shelters, boats, helipads, drone stations, route status, live drone findings, and risk zones.

Outputs: rescue order, supply/medical allocation, shelter recommendations, route recommendations, shortage analysis, and a total action plan.

### 6. Orchestration layer

- Routes events to relevant modules.
- Creates recommended tasks and prevents conflicting assignments.
- Checks resource capability, availability, route validity, safety, and approval requirements.
- Replans on new evidence, blocked routes, new detections, shelter saturation, or shortages.
- Produces explanations: evidence, confidence, urgency, recommended resource, and required approval.

### 7. E-RESQ

Rescue-team and boat coordination, survivor/animal incident handling, route planning, priority-zone response, and shelter assignment.

### 8. E-SUPP

Food, water, medicine, doctor, NGO, shelter, E-CARGO, stock, shortage, and nearby-city mutual-aid coordination.

### 9. E-SWARM

- E-SCOUT: reconnaissance, route verification, flood/obstacle observation, possible person/animal detection, mesh relay.
- E-CARGO: delivery of food, medicine, and emergency essentials subject to authority approval and safety constraints.

## Core entities

| Entity | Essential fields |
|---|---|
| Zone | ID, geometry, risk, uncertainty, population exposure, latest evidence |
| Alert | ID, level, lifecycle state, evidence package, timer, authority decision |
| Route | ID, endpoints, status, access score, source, freshness, confidence |
| Shelter | ID, location, capacity, occupancy, medical needs, stock needs |
| Resource | ID, kind, location, availability, capability, assigned mission |
| Mission | ID, type, priority, target, assigned resources, approval state, lifecycle |
| Observation | source, time, geography, content, confidence, verification state |
| Support Request | need, quantity, urgency, requester, suggested provider, approval/fulfilment state |

## Data and integration rule

Use seeded/simulated data for the hackathon. Keep all integrations replaceable behind adapter interfaces so weather APIs, GIS layers, sensor streams, imagery processors, and drone telemetry can be added later.
