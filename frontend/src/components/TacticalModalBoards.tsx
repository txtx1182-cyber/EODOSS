import React, { useEffect } from 'react';
import { SharedSituationModel } from '../types/situation';
import { ListFilter, Users, Warehouse, Package, X, Anchor } from 'lucide-react';

export type BoardType = 'EVENTS' | 'TEAMS' | 'SHELTERS' | 'INVENTORY' | null;

interface TacticalModalBoardsProps {
  boardType: BoardType;
  onClose: () => void;
  situation: SharedSituationModel;
}

export const TacticalModalBoards: React.FC<TacticalModalBoardsProps> = ({
  boardType,
  onClose,
  situation
}) => {
  // ESC key listener to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!boardType) return null;

  const formatIST = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
    } catch {
      return isoString.slice(11, 19) + ' IST';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(29, 37, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: 24
    }}>
      <div style={{
        width: '100%',
        maxWidth: 960,
        maxHeight: '85vh',
        backgroundColor: '#FFFEFA',
        border: '1px solid #DCD7CC',
        borderRadius: 8,
        boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          height: 52,
          padding: '0 20px',
          backgroundColor: '#F4F1EA',
          borderBottom: '1px solid #DCD7CC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {boardType === 'EVENTS' && <ListFilter size={18} color="#2458A6" />}
            {boardType === 'TEAMS' && <Users size={18} color="#2458A6" />}
            {boardType === 'SHELTERS' && <Warehouse size={18} color="#2458A6" />}
            {boardType === 'INVENTORY' && <Package size={18} color="#C98826" />}

            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#1D252A',
              margin: 0,
              fontFamily: 'var(--font-heading)'
            }}>
              {boardType === 'EVENTS' && 'Operational Event Log'}
              {boardType === 'TEAMS' && 'Field Teams & Rescue Boats'}
              {boardType === 'SHELTERS' && 'Relief Centers & Shelters'}
              {boardType === 'INVENTORY' && 'Supply Reserves & Mutual Aid'}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#FFFEFA',
              border: '1px solid #DCD7CC',
              color: '#5A656E',
              padding: '5px 12px',
              fontSize: 12,
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            className="civic-button-secondary"
          >
            <X size={13} />
            <span>Close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {boardType === 'EVENTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 120px 180px 1fr 90px',
                padding: '8px 12px',
                backgroundColor: '#F4F1EA',
                border: '1px solid #DCD7CC',
                borderRadius: 4,
                fontSize: 11,
                color: '#5A656E',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700
              }}>
                <span>Timestamp</span>
                <span>Module</span>
                <span>Action</span>
                <span>Details & Evidence</span>
                <span style={{ textAlign: 'right' }}>Confidence</span>
              </div>

              {situation.audit_log.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 120px 180px 1fr 90px',
                    alignItems: 'center',
                    padding: '10px 12px',
                    backgroundColor: '#FFFEFA',
                    border: '1px solid #EAE4D7',
                    borderRadius: 4,
                    fontSize: 12.5,
                    color: '#1D252A',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  <span style={{ color: '#5A656E', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>
                    {formatIST(item.timestamp)}
                  </span>
                  <div>
                    <span style={{
                      backgroundColor: '#F4F1EA',
                      border: '1px solid #DCD7CC',
                      color: '#2458A6',
                      padding: '2px 7px',
                      fontSize: 10.5,
                      fontWeight: 600,
                      borderRadius: 3,
                      fontFamily: 'var(--font-heading)'
                    }}>
                      {item.source_module}
                    </span>
                  </div>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: 12 }}>
                    {item.action}
                  </span>
                  <span style={{ color: '#1D252A', lineHeight: 1.4, paddingRight: 10 }}>
                    {item.details}
                  </span>
                  <span style={{ color: '#2B5949', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {item.confidence_pct ? `${item.confidence_pct}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {boardType === 'TEAMS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
              {situation.resources.map(res => (
                <div key={res.id} style={{
                  backgroundColor: '#FFFEFA',
                  border: '1px solid #DCD7CC',
                  borderRadius: 6,
                  padding: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {res.kind === 'RESCUE_BOAT' ? <Anchor size={16} color="#2458A6" /> : <Users size={16} color="#2458A6" />}
                      <span style={{ fontWeight: 700, color: '#1D252A', fontSize: 13, fontFamily: 'var(--font-heading)' }}>
                        {res.name}
                      </span>
                    </div>
                    <span className={res.status === 'AVAILABLE' ? 'badge-safe' : 'badge-caution'}>
                      {res.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: '#5A656E' }}>
                    <div>Type: <strong style={{ color: '#1D252A' }}>{res.kind.replace('_', ' ')}</strong></div>
                    <div>Capacity: <strong style={{ color: '#1D252A' }}>{res.capacity_persons} persons</strong></div>
                    <div>Base Station: <strong style={{ color: '#1D252A' }}>{res.station_location}</strong></div>
                    <div>Coordinates: <strong style={{ color: '#1D252A' }}>[{res.current_coords[0]}, {res.current_coords[1]}]</strong></div>
                  </div>

                  {res.assigned_mission_id && (
                    <div style={{ marginTop: 10, fontSize: 11.5, color: '#2458A6', fontWeight: 600 }}>
                      Assigned Mission: {res.assigned_mission_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {boardType === 'SHELTERS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
              {situation.shelters.map(sh => {
                const occPercent = Math.round((sh.occupancy / sh.capacity) * 100);
                const isCritical = sh.safe_margin < 20;

                return (
                  <div key={sh.id} style={{
                    backgroundColor: '#FFFEFA',
                    border: isCritical ? '1px solid #B83D38' : '1px solid #DCD7CC',
                    borderRadius: 6,
                    padding: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: '#1D252A', fontSize: 13, fontFamily: 'var(--font-heading)' }}>
                        {sh.name}
                      </span>
                      <span className={isCritical ? 'badge-severe' : occPercent > 70 ? 'badge-caution' : 'badge-safe'}>
                        {sh.occupancy} / {sh.capacity} ({occPercent}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: 6, backgroundColor: '#EAE4D7', borderRadius: 3, margin: '10px 0', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(occPercent, 100)}%`,
                        height: '100%',
                        backgroundColor: isCritical ? '#B83D38' : occPercent > 70 ? '#C98826' : '#3F7965'
                      }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: '#5A656E' }}>
                      <div>Safe Margin: <strong style={{ color: isCritical ? '#992B26' : '#1D252A' }}>{sh.safe_margin} beds</strong></div>
                      <div>Food Supply: <strong style={{ color: '#1D252A' }}>{sh.food_days_remaining} days</strong></div>
                      <div>Water Reserve: <strong style={{ color: '#1D252A' }}>{sh.water_liters.toLocaleString()} Liters</strong></div>
                      <div>Medical Staff: <strong style={{ color: '#1D252A' }}>{sh.doctors_present} Doctors</strong></div>
                    </div>

                    <div style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: sh.medical_need.includes('CRITICAL') || sh.medical_need.includes('URGENT') ? '#992B26' : '#5A656E',
                      borderTop: '1px solid #F4F1EA',
                      paddingTop: 8
                    }}>
                      Medical Requirement: {sh.medical_need}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {boardType === 'INVENTORY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
                {situation.inventory.map(stk => (
                  <div key={stk.id} style={{
                    backgroundColor: '#FFFEFA',
                    border: stk.status === 'CRITICAL_SHORTAGE' ? '1px solid #B83D38' : '1px solid #DCD7CC',
                    borderRadius: 6,
                    padding: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: '#1D252A', fontSize: 13, fontFamily: 'var(--font-heading)' }}>
                        {stk.name}
                      </span>
                      <span className={stk.status === 'CRITICAL_SHORTAGE' ? 'badge-severe' : stk.status === 'LOW_STOCK' ? 'badge-caution' : 'badge-safe'}>
                        {stk.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: '#5A656E' }}>
                      <div>Current Stock: <strong style={{ color: '#1D252A' }}>{stk.quantity.toLocaleString()} {stk.unit}</strong></div>
                      <div>Safety Reserve: <strong style={{ color: '#1D252A' }}>{stk.min_threshold.toLocaleString()} {stk.unit}</strong></div>
                      <div>Category: <strong style={{ color: '#1D252A' }}>{stk.category}</strong></div>
                      <div>Depot: <strong style={{ color: '#1D252A' }}>{stk.depot_location}</strong></div>
                    </div>
                  </div>
                ))}
              </div>

              {situation.mutual_aid_requests.length > 0 && (
                <div style={{
                  backgroundColor: '#FDF6E9',
                  border: '1px solid rgba(201, 136, 38, 0.4)',
                  borderRadius: 6,
                  padding: 16
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#9A6514', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                    Active Inter-District Mutual Aid Requisitions
                  </div>
                  {situation.mutual_aid_requests.map(req => (
                    <div key={req.id} style={{ fontSize: 12.5, color: '#1D252A', lineHeight: 1.5 }}>
                      • <strong>{req.id}:</strong> {req.quantity} {req.unit} of {req.item_requested} from {req.recommended_source} ({req.state})
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
