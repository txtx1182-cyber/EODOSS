import { useState, useEffect, useRef } from 'react';
import { SharedSituationModel, DerivedState } from './types/situation';
import { getInitialClientSituation } from './data/seedData';
import { TacticalLogin } from './components/TacticalLogin';
import { TopCommandBar } from './components/TopCommandBar';
import { LeftRackNav } from './components/LeftRackNav';
import { TacticalMap } from './components/TacticalMap';
import { DecisionQueueRack } from './components/DecisionQueueRack';
import { TacticalModalBoards, BoardType } from './components/TacticalModalBoards';
import { ResqView } from './components/views/ResqView';
import { SuppView } from './components/views/SuppView';
import { SwarmView } from './components/views/SwarmView';
import { AuditLogView } from './components/views/AuditLogView';
import { ScaleTestModal } from './components/ScaleTestModal';

export function App() {
  const [user, setUser] = useState<{ name: string; role: string; station: string } | null>(null);
  const [situation, setSituation] = useState<SharedSituationModel>(getInitialClientSituation());
  const [currentView, setCurrentView] = useState<string>('OVERVIEW');
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; data: any } | null>(null);
  const [activeBoard, setActiveBoard] = useState<BoardType>(null);
  const [derived, setDerived] = useState<DerivedState | null>(null);
  const [isScaleTestOpen, setIsScaleTestOpen] = useState(false);

  const fetchDerived = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/engine/derived');
      if (res.ok) {
        const d = await res.json();
        setDerived(d);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchDerived();
    const iv = setInterval(fetchDerived, 3000);
    return () => clearInterval(iv);
  }, []);

  const wsRef = useRef<WebSocket | null>(null);

  // Connect to FastAPI WebSocket for real-time live synchronization
  useEffect(() => {
    if (!user) return;

    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket('ws://localhost:8000/ws/live');
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.incident_name) {
            setSituation(data);
          }
        } catch {
          // ignore keepalive
        }
      };

      socket.onerror = () => {
        console.warn('Backend WebSocket unavailable. Operating in local simulation mode.');
      };
    } catch {
      console.warn('WebSocket init failed, using local simulation engine.');
    }

    return () => {
      if (socket) socket.close();
    };
  }, [user]);

  // 5-minute countdown clock tick
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      setSituation(prev => {
        if (prev.alert.timer_seconds_remaining <= 0) return prev;
        return {
          ...prev,
          alert: {
            ...prev.alert,
            timer_seconds_remaining: prev.alert.timer_seconds_remaining - 1
          }
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [user]);

  // Helper to add audit record locally and sync
  const addAuditRecord = (source: string, action: string, details: string, confidence: number = 95) => {
    const nowStr = new Date().toISOString();
    return {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: nowStr,
      source_module: source,
      action: action,
      details: details,
      confidence_pct: confidence,
      user_id: user?.name || 'Local Authority'
    };
  };

  // REST API trigger helper with local fallback
  const callBackend = async (endpoint: string, payload: any) => {
    try {
      const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setSituation(updated);
        return true;
      }
    } catch {
      // Backend not running, use client-side state transition
    }
    return false;
  };

  // Phase 8: Confirm Disaster Action
  const handleConfirmDisaster = async () => {
    const ok = await callBackend('alert/confirm', {
      user_id: user?.name || 'Shri R. Baruah, IAS',
      notes: 'Corroborated multi-sensor data: Brahmaputra gauge 50.85m (+1.12m) and LISS-4 340ha delta.'
    });

    if (!ok) {
      const nowStr = new Date().toISOString();
      setSituation(prev => {
        const audit = addAuditRecord(
          'AUTHORITY',
          'DISASTER_CONFIRMED',
          'Local Authority confirmed Level 3 Flood Emergency. E-RESQ and E-SUPP operational directives mobilized.',
          100
        );

        const updatedMissions = [...prev.missions];
        if (!updatedMissions.some(m => m.id === 'MSN-RES-01')) {
          updatedMissions.push({
            id: 'MSN-RES-01',
            title: 'E-RESQ Amphibious Rescue: 14 Stranded Villagers at Chandrapur School',
            type: 'RESCUE_DISPATCH',
            priority: 'URGENT',
            target_zone_id: 'ZONE_F',
            target_coords: [26.179, 91.824],
            assigned_resources: ['RES-SDRF-BOAT-03', 'RES-NDRF-01'],
            approval_state: 'AWAITING_APPROVAL',
            explanation: {
              evidence: 'E-SCOUT confirmed 14 persons on rooftop with rising flood level. River water approach recommended.',
              confidence_pct: 98,
              urgency: 'CRITICAL',
              approval_required: true,
              recommended_shelter: 'SH-01 Jalukbari Higher Secondary Relief Shelter'
            },
            created_at: nowStr,
            status_notes: 'Awaiting Local Authority mission sign-off. Boats staging at Pandu.'
          });
        }

        if (!updatedMissions.some(m => m.id === 'MSN-CARGO-01')) {
          updatedMissions.push({
            id: 'MSN-CARGO-01',
            title: 'E-CARGO Emergency Air-Drop: Trauma Packs & ORS to Chandrapur Rooftop',
            type: 'CARGO_DELIVERY',
            priority: 'HIGH',
            target_zone_id: 'ZONE_F',
            target_coords: [26.179, 91.824],
            assigned_resources: ['DRN-CG-01'],
            approval_state: 'AWAITING_APPROVAL',
            explanation: {
              evidence: 'Isolated stranded group has no fresh water or medical aid. E-CARGO drone can deliver in 14 minutes.',
              confidence_pct: 96,
              urgency: 'HIGH',
              approval_required: true,
              payload_description: '8.5 kg Emergency Trauma Kits, ORS, Water Tablets'
            },
            created_at: nowStr,
            status_notes: 'DRN-CG-01 secured at Station Alpha. Awaiting authorization.'
          });
        }

        return {
          ...prev,
          alert: {
            ...prev.alert,
            lifecycle: 'CONFIRMED',
            authority_decision: {
              decision: 'CONFIRMED',
              decided_by: user?.name || 'Local Incident Commander',
              timestamp: nowStr,
              notes: 'Corroborated across 4 sensor streams.'
            }
          },
          incident_phase: 'ACTIVE_RESPONSE_MOBILIZATION',
          missions: updatedMissions,
          audit_log: [audit, ...prev.audit_log]
        };
      });
    }
  };

  const handleMonitorDisaster = async () => {
    await callBackend('alert/monitor', {
      user_id: user?.name || 'Local Authority',
      action: 'MONITORING',
      notes: 'Continuous hydrological monitoring ordered.'
    });
    setSituation(prev => ({
      ...prev,
      alert: { ...prev.alert, lifecycle: 'MONITORING' },
      audit_log: [addAuditRecord('AUTHORITY', 'ALERT_MONITORING', 'Local Authority elected to maintain active monitoring posture.', 90), ...prev.audit_log]
    }));
  };

  const handleEscalateDisaster = async () => {
    await callBackend('alert/escalate', {
      user_id: user?.name || 'Local Authority'
    });
    setSituation(prev => ({
      ...prev,
      alert: {
        ...prev.alert,
        lifecycle: 'ESCALATED',
        escalated_to: 'District Disaster Management Authority (DDMA) Commissioner'
      },
      audit_log: [addAuditRecord('ORCHESTRATOR', 'ESCALATION_TRIGGERED', 'Escalated to District Authority due to sustained severe flood indicators.', 95), ...prev.audit_log]
    }));
  };

  // Phase 14: E-SCOUT Drone Reconnaissance Dispatch
  const handleDispatchRecon = async () => {
    const ok = await callBackend('missions/recon', {
      drone_id: 'DRN-SC-01',
      target_zone: 'ZONE_F'
    });

    if (!ok) {
      setSituation(prev => {
        const audit1 = addAuditRecord(
          'E-SWARM',
          'RECON_DISPATCHED',
          'E-SCOUT-01 launched from Station Alpha to Zone F Chandrapur. 4K optical & FLIR telemetry live.',
          98
        );
        const audit2 = addAuditRecord(
          'ORCHESTRATOR',
          'REPLANNING_TRIGGERED',
          'Drone verified Route RT-03 is BLOCKED (culvert washed away). Incident INC-01 upgraded to VERIFIED_TARGET (14 people on school rooftop). Recalculating amphibious boat route.',
          99
        );

        const updatedRoutes = prev.routes.map(r => {
          if (r.id === 'RT-03') {
            return {
              ...r,
              status: 'BLOCKED' as const,
              access_score: 5,
              source: 'E-SCOUT-01 High-Res Video Feed',
              freshness_min: 1,
              confidence_pct: 99,
              notes: 'VERIFIED BLOCKED: 15-meter embankment breach with torrential flow. Wheeled access cut off.'
            };
          }
          return r;
        });

        const updatedIncidents = prev.incidents.map(inc => {
          if (inc.id === 'INC-01') {
            return {
              ...inc,
              status: 'VERIFIED_TARGET' as const,
              confidence_pct: 98,
              verified_by: 'E-SCOUT-01 CV & Operator Sign-off'
            };
          }
          return inc;
        });

        const updatedDrones = prev.drones.map(d => {
          if (d.id === 'DRN-SC-01') {
            return {
              ...d,
              status: 'MISSION_ACTIVE' as const,
              current_mission_id: 'MSN-REC-01',
              location: [26.179, 91.824] as [number, number]
            };
          }
          return d;
        });

        const updatedMissions = prev.missions.map(m => {
          if (m.id === 'MSN-REC-01') {
            return {
              ...m,
              approval_state: 'COMPLETED' as const,
              status_notes: 'Reconnaissance completed. 14 survivors confirmed on rooftop. Road washed out.'
            };
          }
          return m;
        });

        return {
          ...prev,
          routes: updatedRoutes,
          incidents: updatedIncidents,
          drones: updatedDrones,
          missions: updatedMissions,
          audit_log: [audit2, audit1, ...prev.audit_log]
        };
      });
    }
  };

  // Phase 10 / 15: Approve Rescue or Cargo Mission
  const handleApproveMission = async (missionId: string) => {
    const ok = await callBackend('missions/approve', {
      mission_id: missionId,
      user_id: user?.name || 'Local Authority'
    });

    if (!ok) {
      setSituation(prev => {
        const audit = addAuditRecord(
          missionId.includes('RES') ? 'E-RESQ' : 'E-SUPP',
          'MISSION_APPROVED',
          `Mission ${missionId} authorized by Local Authority. Units dispatched to operational area.`,
          100
        );

        const updatedMissions = prev.missions.map(m => {
          if (m.id === missionId) {
            return {
              ...m,
              approval_state: 'APPROVED' as const,
              status_notes: `Authorized by ${user?.name || 'Local Authority'}. En route.`
            };
          }
          return m;
        });

        const updatedResources = prev.resources.map(r => {
          if (r.id === 'RES-SDRF-BOAT-03' || r.id === 'RES-NDRF-01') {
            return { ...r, status: 'DEPLOYED', assigned_mission_id: missionId };
          }
          return r;
        });

        return {
          ...prev,
          missions: updatedMissions,
          resources: updatedResources,
          audit_log: [audit, ...prev.audit_log]
        };
      });
    }
  };

  // Phase 15: Precision Cargo Air-Drop
  const handleExecuteCargoDrop = async (missionId: string) => {
    const ok = await callBackend('missions/cargo-drop', {
      mission_id: missionId
    });

    if (!ok) {
      setSituation(prev => {
        const audit = addAuditRecord(
          'E-SWARM',
          'CARGO_DELIVERY_SUCCESS',
          'E-CARGO-01 executed precision winch air-drop of 8.5kg trauma & hydration supplies to Chandrapur school rooftop. Target confirmed receipt.',
          99
        );

        const updatedMissions = prev.missions.map(m => {
          if (m.id === missionId) {
            return {
              ...m,
              approval_state: 'COMPLETED' as const,
              status_notes: 'Payload delivered safely. DRN-CG-01 returning to base.'
            };
          }
          return m;
        });

        const updatedShelters = prev.shelters.map(sh => {
          if (sh.id === 'SH-04') {
            return {
              ...sh,
              medical_need: 'Stabilized - Emergency trauma kit & ORS delivered by E-CARGO-01',
              water_liters: sh.water_liters + 400
            };
          }
          return sh;
        });

        const updatedDrones = prev.drones.map(d => {
          if (d.id === 'DRN-CG-01') {
            return {
              ...d,
              status: 'RETURNING' as const,
              battery_pct: d.battery_pct - 18,
              current_payload_kg: 0
            };
          }
          return d;
        });

        return {
          ...prev,
          missions: updatedMissions,
          shelters: updatedShelters,
          drones: updatedDrones,
          audit_log: [audit, ...prev.audit_log]
        };
      });
    }
  };

  // Phase 12: Mutual Aid Approval
  const handleApproveMutualAid = async (requestId: string) => {
    const ok = await callBackend('mutual-aid/approve', {
      request_id: requestId,
      user_id: user?.name || 'Local Authority'
    });

    if (!ok) {
      setSituation(prev => {
        const audit = addAuditRecord(
          'E-SUPP',
          'MUTUAL_AID_APPROVED',
          `Mutual Aid Request ${requestId} authorized. Requisition transmitted to Tezpur Regional Medical Depot via National Disaster Logistics Gateway.`,
          100
        );

        const updatedReqs = prev.mutual_aid_requests.map(req => {
          if (req.id === requestId) {
            return {
              ...req,
              state: 'APPROVED_TRANSMITTED' as const,
              approved_by: user?.name || 'Local Authority',
              approved_at: new Date().toISOString(),
              fulfillment_notes: 'Transmitted to Tezpur Logistics Depot. Supply convoy rolling on NH-15.'
            };
          }
          return req;
        });

        return {
          ...prev,
          mutual_aid_requests: updatedReqs,
          audit_log: [audit, ...prev.audit_log]
        };
      });
    }
  };

  // Reset Scenario
  const handleReset = async () => {
    await callBackend('situation/reset', {});
    setSituation(getInitialClientSituation());
    setSelectedEntity(null);
  };

  // OPERATIONAL BLACKOUT UNTIL AUTHENTICATED
  if (!user) {
    return <TacticalLogin onSuccess={(authenticatedUser) => setUser(authenticatedUser)} />;
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#F4F1EA',
      overflow: 'hidden'
    }}>
      {/* Top Header Bar (Height 60px) */}
      <TopCommandBar
        onReset={handleReset}
        user={user}
        onLogout={() => setUser(null)}
        onOpenScaleTest={() => setIsScaleTestOpen(true)}
      />

      {/* Main Workspace (Height: calc(100vh - 60px)) */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        height: 'calc(100vh - 60px)'
      }}>
        {/* Left Sidebar (Width 250px) */}
        <LeftRackNav
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenBoard={setActiveBoard}
          eventsCount={situation.audit_log.length}
          teamsCount={situation.resources.length}
          sheltersCount={situation.shelters.length}
          stockCount={situation.inventory.length}
        />

        {/* Center Workspace (Takes full vertical height) */}
        <main style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden' }}>
          {currentView === 'OVERVIEW' && (
            <TacticalMap
              situation={situation}
              onSelectEntity={setSelectedEntity}
              selectedEntity={selectedEntity}
            />
          )}

          {currentView === 'E_RESQ' && (
            <ResqView
              situation={situation}
              onApproveMission={handleApproveMission}
            />
          )}

          {currentView === 'E_SUPP' && (
            <SuppView
              situation={situation}
              onApproveMutualAid={handleApproveMutualAid}
            />
          )}

          {currentView === 'E_SWARM' && (
            <SwarmView
              situation={situation}
              onDispatchRecon={handleDispatchRecon}
              onExecuteCargoDrop={handleExecuteCargoDrop}
            />
          )}

          {currentView === 'AUDIT' && (
            <AuditLogView
              situation={situation}
            />
          )}
        </main>

        {/* Right Panel: Authority Decision Brief (Width 360px) */}
        <aside style={{ height: '100%' }}>
          <DecisionQueueRack
            situation={situation}
            derived={derived}
            onConfirmDisaster={handleConfirmDisaster}
            onMonitorDisaster={handleMonitorDisaster}
            onEscalateDisaster={handleEscalateDisaster}
            onDispatchRecon={handleDispatchRecon}
            onApproveMission={handleApproveMission}
            onExecuteCargoDrop={handleExecuteCargoDrop}
            onApproveMutualAid={handleApproveMutualAid}
            selectedEntity={selectedEntity}
            onClearSelection={() => setSelectedEntity(null)}
            onSelectZone={(zoneId) => {
              const zone = situation.zones.find(z => z.id === zoneId);
              if (zone) {
                setSelectedEntity({ type: 'Zone', data: zone });
              }
            }}
          />
        </aside>
      </div>

      {/* On-Demand Daylight Tactical Overlay Boards */}
      <TacticalModalBoards
        boardType={activeBoard}
        onClose={() => setActiveBoard(null)}
        situation={situation}
      />

      {/* Headless Scale-Test Simulation Comparison Modal */}
      <ScaleTestModal
        isOpen={isScaleTestOpen}
        onClose={() => setIsScaleTestOpen(false)}
      />
    </div>
  );
}

export default App;
