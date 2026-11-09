# EODOSS Tactical UI UX Specification

## Design intent

Build a dense emergency-operations GIS console inspired by professional public-safety and tactical displays. It must not look like a generic AI SaaS dashboard.

## Non-negotiable constraints

- No neon purple/pink/cyan gradients, glassmorphism, glowing shadows, marketing hero copy, emoji icons, stock illustrations, giant whitespace, bubbly cards, or floating pill navigation.
- Use compact spacing, sharp structural 1px borders, and `rounded-none` or `rounded-sm` (maximum 2px).
- Use map, evidence, decision state, and operational logs as the primary visual language.

## Color tokens

| Purpose | Hex |
|---|---|
| Console background | `#0B0F14` |
| Panel surface | `#121820` |
| Elevated/hover row | `#18202C` |
| Hairline/divider | `#263244` |
| Primary text | `#E2E8F0` |
| Secondary label | `#94A3B8` |
| Severe risk | `#DC2626` |
| High caution | `#D97706` |
| Verified safe | `#15803D` |
| Uncertainty | `#EAB308` |
| Conflict / blackout | `#F97316` |

## Map and mesh semantics

| Map item | Visual rule |
|---|---|
| Severe hazard | `#DC2626`, 30% polygon fill, solid badge |
| Caution risk | `#D97706`, 22% polygon fill |
| Verified safe | `#15803D`, 12% polygon fill |
| Unverified/uncertain | `#EAB308`, diagonal hatching + 2px dashed border |
| Conflict/comms blackout | `#F97316`, beacon and `[CONFLICT]` tag |
| EOC base gateway | White square/tower symbol and concentric range ring |
| E-SCOUT | Blue `#0284C7` diamond/chevron node |
| E-CARGO | Orange `#EA580C` hexagonal node |
| Strong mesh link | Green `#10B981`, 1.5px solid line |
| Relay mesh link | Amber `#F59E0B`, 1px dashed line |
| No uplink | Red `#EF4444` ring and `[NO MESH UPLINK]` |

## Typography

- UI labels and content: Inter or IBM Plex Sans.
- Technical labels: uppercase, 11px, semibold, tracking `0.06em`.
- Telemetry, coordinates, timers, RSSI values, IDs, and scores: JetBrains Mono or IBM Plex Mono with tabular numbers.

## Login screen

- Full operational blackout until authenticated: do not mount GIS/map or fetch zone data/open WebSocket connections.
- Center one 420px wide panel on `#0B0F14`, surface `#121820`, border `1px solid #263244`.
- Header: `EODOSS // RESTRICTED EMERGENCY OPERATIONS TERMINAL`.
- Step 1: authority email/responder ID and passphrase.
- Step 2: `is_verified` gate plus six-digit Dispatch Verification Code.
- Use one generic failure response for unknown email, invalid passphrase, and unverified account. Production must use backend timing controls.
- Include a clearly bounded demo-only control: `[DEV/JUDGE DEMO CREDENTIAL]`.

## Dashboard layout

```text
Top command bar: incident, alert lifecycle, clock, authority role, comms status
Left rack: operations navigation and layer controls
Center: tactical GIS map, zone polygons, routes, drones, teams, shelters, mesh links
Right rack: decision queue, evidence dossier, approval controls, resource summary
Bottom rack: event log, live telemetry, E-RESQ/E-SUPP mission tables, audit feed
```

## Required interaction states

- Hover/select zone: show risk calculation, confidence, source, freshness, and recommended action.
- Approval: show full evidence and action impact before confirm/reject.
- Live updates: update only relevant map elements/racks; preserve user context.
- Critical alert: flat red state with concrete language; no animation except a restrained urgency indicator.
- Empty/error states: technical, plain-language explanation and retry/monitor action.
