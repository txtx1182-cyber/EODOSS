# EODOSS Product Requirements Document

## Product summary

EODOSS is a human-supervised disaster-operations application that helps authorities detect flood risk, verify an incident, coordinate rescue and supplies, use drone reconnaissance to reduce uncertainty, and keep all teams synchronized.

## Problem

Flood response decisions depend on information that may be incomplete, stale, conflicting, or unavailable. Authorities need one operational picture that connects hazard evidence, people at risk, route access, resource availability, shelter capacity, field observations, and approval-controlled action.

## Target users

- Local Authority: reviews alerts and approves/rejects incident and mission decisions.
- District Authority: receives escalation when local authority does not respond to sustained high risk.
- E-RESQ Operator: manages rescue teams, boats, targets, routes, and shelters.
- E-SUPP Operator: manages doctors, NGOs, stock, shelters, E-CARGO, shortages, and mutual aid.
- Viewer/Auditor: observes situation and audit log without approving actions.

## Goals

1. Demonstrate evidence-driven flood detection and authority review.
2. Demonstrate a shared operational state across authority, rescue, supply, and drones.
3. Demonstrate live replanning after a drone observation or route/resource change.
4. Demonstrate human approval and auditable decision making.
5. Deliver a credible 3–5 minute hackathon video.

## Core user stories

- As a Local Authority, I can see a potential flood alert, its evidence, confidence, and response timer so I can confirm, monitor, or reject it.
- As a District Authority, I can review a properly packaged escalation when local authority does not respond.
- As an E-RESQ operator, I can view priority zones, targets, teams, boats, routes, and shelters to coordinate rescue.
- As an E-SUPP operator, I can see stock, shelter needs, doctor/NGO routes, and shortages to coordinate support.
- As an operator, I can assign E-SCOUT reconnaissance or E-CARGO delivery missions after approval.
- As an authority, I can approve a mutual-aid request to nearby cities/districts if local support is inadequate.
- As any authorized user, I see shared updates from the other modules in real time.

## Functional requirements

- Two-step authority login with demo bypass only in demo mode.
- Flood risk/uncertainty calculation from weather, sensor, and imagery simulation inputs.
- Alert lifecycle, five-minute local review timer, and district escalation path.
- Tactical map with zones, routes, shelters, teams, boats, drones, mesh links, and semantic status colors.
- E-RESQ, E-SUPP, and E-SWARM views linked to a common state.
- Mission generation, approval, assignment, active/completed/failure state, and audit events.
- Shortage detection and reviewable mutual-aid request workflow.
- Resettable seeded demo scenario.

## Non-functional requirements

- Desktop-first 1366px+ presentation quality; no broken experience at standard laptop sizes.
- Clear source, timestamp, confidence, freshness, and verification status.
- Fast simulated state updates without visible numeric jitter.
- Keyboard-accessible main approval controls and readable color contrast.
- No unauthenticated map or scenario-data loading.

## Success criteria

- A viewer can understand the situation and next authority decision within 15 seconds.
- A complete demo flow works without network/API dependence.
- Every high-impact action has a visible approval and audit trail.
- A new drone observation visibly updates at least E-RESQ, E-SUPP, and authority decision context.

## Out of scope

- Actual emergency-service dispatch, real-world drone control, deployment claims, verified medical triage, or live government system integration.
