# EODOSS System and Operation Rules

## Authority and alert rules

1. No operational map, incident data, zone coordinates, or live connection is mounted before authentication.
2. Detection creates a `PENDING_LOCAL_REVIEW` alert with evidence, risk, confidence, and a five-minute acknowledgement timer.
3. Local authority may confirm disaster, reject/continue monitoring, or request verification.
4. If the timer expires and risk remains above threshold, escalate to district authority with the full evidence package.
5. Acknowledgement is not confirmation. Every decision is timestamped, attributed, and auditable.
6. Demo credentials are only allowed in demo mode and must not exist in production configuration.

## Alert lifecycle

```text
DETECTED → PENDING_LOCAL_REVIEW → CONFIRMED | MONITORING
PENDING_LOCAL_REVIEW → ESCALATED
CONFIRMED → ACTIVE_RESPONSE → RESOLVED
```

## Automation boundaries

The system may automatically ingest data, calculate scores, notify users, draft missions, request low-risk reconnaissance, and draft mutual-aid requests.

The system must require authority approval to confirm a disaster, dispatch high-impact rescue/evacuation operations, dispatch major supplies, send inter-city support requests, or materially change an approved plan.

## Data-quality rules

- Display source, timestamp, freshness, confidence, and verification status beside material information.
- Stale, missing, low-confidence, conflicting, and verified information must have separate states.
- A person/animal observed by a drone is a `POSSIBLE_INCIDENT` until human or approved rule-based verification.
- Never represent simulation data as live operational data.

## E-RESQ rules

- Do not assign a resource to overlapping active missions unless explicitly approved.
- Route plans require access status and confidence.
- Rescue priority considers hazard severity, people at risk, route access, evidence confidence, and available rescue capacity.
- Replan if route status, survivor observation, resource status, or zone severity changes.

## E-SUPP rules

- Track stock by item, quantity, location, destination, status, and expiry when relevant.
- Shelter demand considers occupancy, capacity, medical needs, and expected consumption.
- Shortage alert triggers when minimum availability is breached.
- Mutual-aid requests must state what is needed, quantity, urgency, affected location, source city/district, and fulfilment status.

## E-SWARM rules

- E-SCOUT performs observation and route verification.
- E-CARGO performs authorized supply delivery only where payload, battery, weather, and safe-delivery conditions are valid.
- Drone observations are shared immediately with Authority, E-RESQ, and E-SUPP.
- Mesh connectivity must show strong, relay, or partitioned state; a partitioned node must be clearly marked `NO MESH UPLINK`.

## Replanning rules

Any event affecting risk, route accessibility, people/animal detections, shelter capacity, resource availability, stock, or communication quality triggers recalculation of impacted recommendations and updates the activity/audit log.
