# EODOSS Project Context and Memory Log

## Identity

- **Name:** Emergency Operations and Disaster Orchestration Support System (EODOSS)
- **Purpose:** Human-supervised AI decision support for climate-disaster response.
- **Initial scenario:** Flood response in Guwahati/Assam simulation.
- **Hackathon goal:** A polished, credible simulation demonstrating detection, authority confirmation, rescue/logistics orchestration, drone reconnaissance, live updates, and replanning.

## Evidence-based positioning

Prior-art review shows that forecasting, satellite mapping, drone reconnaissance, multi-agent coordination, dispatch optimization, and operational dashboards already exist. Do not claim EODOSS invents them.

The potential EODOSS contribution is an explicit information-state model—freshness, provenance, confidence, uncertainty, and conflict status—used for both priority calculation and targeted information gathering across preparedness and active response.

## Claims to avoid

- Do not claim a deployed autonomous drone swarm.
- Do not claim all disaster communications are delay-free or solved.
- Do not claim verified novelty or operational readiness.
- Do not imply integration with NDMA, FEMA, NATO, local government, real emergency services, or live data unless actually established.

## Product decisions made

- Backend is split into Prediction, Calculation/Planning, and Execution.
- Authority confirmation occurs after a local alert; unanswered high-risk alert escalates after five minutes to district authority.
- E-RESQ handles rescue teams, boats, targets, routes, priority zones, and shelters.
- E-SUPP handles food, medicine, doctors, NGOs, shelters, stock, E-CARGO, shortages, and mutual aid.
- E-SWARM consists of E-SCOUT reconnaissance and E-CARGO logistics drones.
- All modules synchronize through a shared event/state model.
- Authority approvals and auditability are mandatory for consequential actions.
- First build uses seed data and simulated events.
- Tactical EOC GIS console is the mandated visual direction.

## Current documents

- `EODOSS_Product_Requirements_v0.1.md`: earlier consolidated requirements document.
- `planning/01_system_architecture.md`: architecture specification.
- `planning/02_implementation_phases.md`: 18-phase build plan.
- `planning/03_system_and_operation_rules.md`: operating rules and authority boundaries.
- `planning/04_visual_design_ui_ux.md`: tactical frontend specification.
- `planning/06_tech_stack.md`: technology recommendation.
- `planning/07_prd.md`: product requirements document.
- `planning/08_deepseek_research_brief.md`: research-ready context pack.

## Open decisions

- Exact risk-score formula and calibration.
- Exact simulated geography and zone coordinates.
- Real data sources and licensing for a future version.
- Drone hardware, flight rules, payload, mesh protocol, and operating constraints.
- Exact user/authority hierarchy and service-level escalation policy.
- Final deployment target, authentication provider, and database hosting.
