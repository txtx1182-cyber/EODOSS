# EODOSS Recommended Tech Stack

## Hackathon architecture choice

Use a modern TypeScript web app with a simulation-first backend. Favor simplicity, deterministic seeded scenarios, and a strong tactical UI over complex real-time infrastructure.

## Frontend

| Need | Recommendation |
|---|---|
| Application framework | React + TypeScript + Vite |
| Styling | Tailwind CSS with custom tactical tokens; no default rounded SaaS component look |
| UI primitives | Radix UI only where needed; build custom panels/tables for the tactical appearance |
| Map | MapLibre GL JS or Leaflet; use local GeoJSON for demo zones/routes |
| Data fetching | TanStack Query for API state |
| Client state | Zustand or Redux Toolkit for selected map state and simulation controls |
| Icons | Lucide icons selectively; use map symbols and clear labels over decorative icons |
| Charts | Recharts only for small operational trend graphs; map and tables are primary |

## Backend

| Need | Recommendation |
|---|---|
| API | Python FastAPI |
| Validation | Pydantic |
| Database | PostgreSQL + PostGIS for production-ready spatial model; SQLite/local JSON acceptable for demo fallback |
| ORM | SQLAlchemy |
| Real-time updates | WebSocket endpoint or Server-Sent Events |
| Background simulation | Async task/service that emits deterministic seeded events |
| Authentication demo | Mock secure session with role checks; never expose map data before logged-in state |

## Data and geospatial formats

- GeoJSON: zones, flood polygons, routes, shelters, stations, and assets.
- JSON: resource records, observations, alerts, events, missions, and support requests.
- ISO 8601 UTC timestamps internally; render IST in UI.
- Store source, freshness, confidence, and verification state on every observation.

## Suggested project layout

```text
eodoss/
  frontend/
    src/
      features/auth/
      features/command/
      features/map/
      features/alerts/
      features/resq/
      features/supp/
      features/swarm/
      components/tactical/
      data/scenarios/
  backend/
    app/
      api/
      models/
      services/prediction/
      services/calculation/
      services/orchestration/
      services/simulation/
      seed/
  docs/
```

## Avoid for the first demo

- Real emergency messages, real drone control, payment/service integrations, or claims of live government data.
- Microservices, Kubernetes, complex message brokers, and model training pipelines.
- API keys in client code.

## Build priority

First make a static seeded scenario work end-to-end. Then add the FastAPI simulation API and real-time event stream. Add PostGIS, external APIs, and real drone integrations only after the demo is stable.
