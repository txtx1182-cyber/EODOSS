import React from 'react';
import { SharedSituationModel, DerivedState } from '../types/situation';
import { AlertTriangle, Clock, Check, Send, Package, X } from 'lucide-react';
import { EvidenceChips } from './EvidenceChips';
import { DecisionQuadrant } from './DecisionQuadrant';

interface DecisionQueueRackProps {
  situation: SharedSituationModel;
  derived?: DerivedState | null;
  onConfirmDisaster: () => void;
  onMonitorDisaster: () => void;
  onEscalateDisaster: () => void;
  onDispatchRecon: () => void;
  onApproveMission: (missionId: string) => void;
  onExecuteCargoDrop: (missionId: string) => void;
  onApproveMutualAid: (requestId: string) => void;
  selectedEntity: { type: string; data: any } | null;
  onClearSelection: () => void;
  onSelectZone?: (zoneId: string) => void;
}

export const DecisionQueueRack: React.FC<DecisionQueueRackProps> = ({
  situation,
  derived,
  onConfirmDisaster,
  onMonitorDisaster,
  onEscalateDisaster,
  onDispatchRecon,
  onApproveMission,
  onExecuteCargoDrop,
  onApproveMutualAid,
  selectedEntity,
  onClearSelection,
  onSelectZone
}) => {
  const isPendingReview = situation.alert.lifecycle === 'PENDING_LOCAL_REVIEW';
  const isConfirmed = situation.alert.lifecycle === 'CONFIRMED' || situation.alert.lifecycle === 'ACTIVE_RESPONSE';
  const isEscalated = situation.alert.lifecycle === 'ESCALATED';

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      width: 360,
      height: '100%',
      backgroundColor: '#FFFEFA',
      borderLeft: '1px solid #DCD7CC',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid #DCD7CC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          color: isPendingReview ? '#B83D38' : '#1D252A',
          margin: 0
        }}>
          Authority Decision Brief
        </h2>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          color: '#5A656E'
        }}>
          Human-in-the-Loop
        </span>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* PENDING DISASTER ALERT CARD */}
        {isPendingReview && (
          <div style={{
            backgroundColor: '#FFFEFA',
            border: '1px solid #B83D38',
            borderRadius: 6,
            padding: 16,
            boxShadow: '0 2px 8px rgba(184, 61, 56, 0.08)'
          }}>
            {/* Alert Banner Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#FBECEB',
              border: '1px solid rgba(184, 61, 56, 0.25)',
              color: '#992B26',
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              marginBottom: 12
            }}>
              <AlertTriangle size={13} color="#B83D38" />
              <span>Potential Flood Event Detected</span>
            </div>

            <div style={{ fontSize: 13, color: '#1D252A', fontFamily: 'var(--font-body)', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                <span><strong>Sector:</strong> {situation.alert.location_name}</span>
                <EvidenceChips zoneId={situation.alert.zone_id} derived={derived} recentInputs={situation.recent_inputs} />
              </div>
              <div><strong>Severity:</strong> Level 3 Severe ({situation.alert.confidence_pct}% Corroborated)</div>
            </div>

            {/* Response Window Timer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F4F1EA',
              border: '1px solid #DCD7CC',
              borderRadius: 6,
              padding: '8px 12px',
              marginBottom: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5A656E', fontWeight: 600 }}>
                <Clock size={14} color="#5A656E" />
                <span>Response Window</span>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 700,
                color: '#B83D38'
              }}>
                {formatTimer(situation.alert.timer_seconds_remaining)} remaining
              </span>
            </div>

            {/* Numbered Evidence Section */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: '#5A656E',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 6
              }}>
                Corroborated Evidence
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#1D252A', fontFamily: 'var(--font-body)' }}>
                {situation.alert.evidence_summary.map((ev, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: '#2458A6' }}>{idx + 1}.</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Stacked, full-width, clean labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={onConfirmDisaster}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  backgroundColor: '#2458A6',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 2px 6px rgba(36, 88, 166, 0.25)',
                  transition: 'background-color 0.15s ease'
                }}
                className="civic-button-primary"
              >
                <Check size={16} />
                <span>Confirm Disaster & Activate Directives</span>
              </button>

              <button
                onClick={onMonitorDisaster}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  backgroundColor: '#FFFEFA',
                  color: '#1D252A',
                  border: '1px solid #DCD7CC',
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer'
                }}
                className="civic-button-secondary"
              >
                Continue Monitoring
              </button>

              <button
                onClick={onEscalateDisaster}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  backgroundColor: '#FFFEFA',
                  color: '#1D252A',
                  border: '1px solid #DCD7CC',
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer'
                }}
                className="civic-button-secondary"
              >
                Escalate to District
              </button>
            </div>
          </div>
        )}

        {isEscalated && (
          <div style={{
            backgroundColor: '#FDF6E9',
            border: '1px solid rgba(201, 136, 38, 0.4)',
            borderRadius: 6,
            padding: 14
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9A6514', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
              Escalated to District Authority
            </div>
            <p style={{ fontSize: 12.5, color: '#5A656E', lineHeight: 1.4, margin: 0 }}>
              The local acknowledgment window expired. Evidence dossier transmitted to District Disaster Management Authority (DDMA) for emergency directive authorization.
            </p>
          </div>
        )}

        {/* DECISION QUADRANT (2x2 ENGINE) */}
        <DecisionQuadrant derived={derived} onSelectZone={onSelectZone} />

        {/* ACTIVE DIRECTIVES & MISSION AUTHORIZATIONS */}
        {isConfirmed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #DCD7CC',
              paddingBottom: 6
            }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 12,
                fontWeight: 700,
                color: '#1D252A',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Operational Directives ({situation.missions.length})
              </span>
              <span className="badge-safe">
                Active Mobilization
              </span>
            </div>

            {situation.missions.map(mission => {
              const isApproved = mission.approval_state === 'APPROVED' || mission.approval_state === 'ACTIVE' || mission.approval_state === 'COMPLETED';

              return (
                <div key={mission.id} style={{
                  backgroundColor: '#FFFEFA',
                  border: isApproved ? '1px solid #3F7965' : '1px solid #DCD7CC',
                  borderRadius: 6,
                  padding: 14,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#2458A6' }}>
                      {mission.id} · {mission.type}
                    </span>
                    <span className={isApproved ? 'badge-safe' : 'badge-caution'}>
                      {mission.approval_state}
                    </span>
                  </div>

                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1D252A', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>
                    {mission.title}
                  </h4>

                  <p style={{ fontSize: 12, color: '#5A656E', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    {mission.explanation.evidence}
                  </p>

                  {mission.approval_state === 'AWAITING_APPROVAL' && (
                    <button
                      onClick={() => {
                        if (mission.id === 'MSN-REC-01') onDispatchRecon();
                        else onApproveMission(mission.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#2458A6',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                      className="civic-button-primary"
                    >
                      <Check size={14} />
                      <span>Authorize Directive</span>
                    </button>
                  )}

                  {mission.approval_state === 'APPROVED' && mission.id === 'MSN-CARGO-01' && (
                    <button
                      onClick={() => onExecuteCargoDrop(mission.id)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#EA580C',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Package size={14} />
                      <span>Execute Air-Drop</span>
                    </button>
                  )}

                  {mission.approval_state === 'COMPLETED' && (
                    <div style={{ fontSize: 11.5, color: '#2B5949', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                      <Check size={13} color="#3F7965" />
                      <span>{mission.status_notes}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* MUTUAL AID REQUISITION CARD */}
            {situation.mutual_aid_requests.length > 0 && (
              <div style={{
                backgroundColor: '#FFFEFA',
                border: '1px solid #DCD7CC',
                borderRadius: 6,
                padding: 14
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#9A6514' }}>
                    Inter-District Mutual Aid
                  </span>
                  <span className={situation.mutual_aid_requests[0].state === 'DRAFTED' ? 'badge-caution' : 'badge-safe'}>
                    {situation.mutual_aid_requests[0].state}
                  </span>
                </div>

                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1D252A', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>
                  {situation.mutual_aid_requests[0].item_requested}
                </h4>

                <div style={{ fontSize: 12, color: '#5A656E', marginBottom: 10, lineHeight: 1.4 }}>
                  <div>Quantity: <strong>{situation.mutual_aid_requests[0].quantity} {situation.mutual_aid_requests[0].unit}</strong></div>
                  <div>Source: <strong>{situation.mutual_aid_requests[0].recommended_source}</strong></div>
                  <div>Corridor: <strong>{situation.mutual_aid_requests[0].proposed_route}</strong></div>
                </div>

                {situation.mutual_aid_requests[0].state === 'DRAFTED' ? (
                  <button
                    onClick={() => onApproveMutualAid(situation.mutual_aid_requests[0].id)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#2458A6',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                    className="civic-button-primary"
                  >
                    <Send size={14} />
                    <span>Authorize Requisition</span>
                  </button>
                ) : (
                  <div style={{ fontSize: 11.5, color: '#2B5949', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                    <Check size={13} color="#3F7965" />
                    <span>Convoys en route from Tezpur Depot</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected Entity Card */}
        {selectedEntity && (
          <div style={{
            backgroundColor: '#F4F1EA',
            border: '1px solid #DCD7CC',
            borderRadius: 6,
            padding: 14
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1D252A', fontFamily: 'var(--font-heading)' }}>
                {selectedEntity.type} Details
              </span>
              <button
                onClick={onClearSelection}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5A656E',
                  cursor: 'pointer',
                  padding: 2
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ fontSize: 12, color: '#1D252A', lineHeight: 1.4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                <span><strong>Name / ID:</strong> {selectedEntity.data.name || selectedEntity.data.title || selectedEntity.data.id}</span>
                {selectedEntity.type === 'Zone' && (
                  <EvidenceChips zoneId={selectedEntity.data.id} derived={derived} recentInputs={situation.recent_inputs} />
                )}
              </div>
              {selectedEntity.data.risk_score && <div><strong>Risk Score:</strong> {selectedEntity.data.risk_score}%</div>}
              {selectedEntity.data.population_exposed && <div><strong>Population Exposed:</strong> {selectedEntity.data.population_exposed.toLocaleString()}</div>}
              {selectedEntity.data.occupancy && <div><strong>Occupancy:</strong> {selectedEntity.data.occupancy} / {selectedEntity.data.capacity}</div>}
              {selectedEntity.data.battery_pct && <div><strong>Battery:</strong> {selectedEntity.data.battery_pct}%</div>}
              {selectedEntity.data.status && <div><strong>Status:</strong> {selectedEntity.data.status}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
