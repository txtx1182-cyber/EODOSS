import React from 'react';
import { SharedSituationModel } from '../../types/situation';
import { Truck, Send, Check } from 'lucide-react';

interface SuppViewProps {
  situation: SharedSituationModel;
  onApproveMutualAid: (requestId: string) => void;
}

export const SuppView: React.FC<SuppViewProps> = ({ situation, onApproveMutualAid }) => {
  return (
    <div style={{
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#F4F1EA'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #DCD7CC',
        paddingBottom: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: '#C98826',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Truck size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1D252A', margin: 0, fontFamily: 'var(--font-heading)' }}>
              E-SUPP — Relief & Medical Logistics
            </h2>
            <div style={{ fontSize: 12, color: '#5A656E' }}>
              Consumables inventory, medical supplies, and inter-district mutual aid requisitions
            </div>
          </div>
        </div>
      </div>

      {/* Mutual Aid Requests Section */}
      <div style={{
        backgroundColor: '#FFFEFA',
        border: '1px solid #DCD7CC',
        borderRadius: 6,
        padding: 18
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1D252A', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
          Inter-District Mutual Aid Requisitions
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {situation.mutual_aid_requests.map(req => (
            <div key={req.id} style={{
              backgroundColor: '#F4F1EA',
              border: '1px solid #DCD7CC',
              borderRadius: 6,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1D252A', fontFamily: 'var(--font-heading)' }}>
                    {req.id}: {req.item_requested}
                  </span>
                  <span className={req.state === 'DRAFTED' ? 'badge-caution' : 'badge-safe'}>
                    {req.state}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#5A656E', marginTop: 4 }}>
                  Requested Quantity: <strong>{req.quantity} {req.unit}</strong> · Source: <strong>{req.recommended_source}</strong>
                </div>
                <div style={{ fontSize: 11.5, color: '#83909C', marginTop: 2 }}>
                  Proposed Transit Corridor: {req.proposed_route}
                </div>
              </div>

              {req.state === 'DRAFTED' ? (
                <button
                  onClick={() => onApproveMutualAid(req.id)}
                  style={{
                    backgroundColor: '#2458A6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 14px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  className="civic-button-primary"
                >
                  <Send size={14} />
                  <span>Authorize Requisition</span>
                </button>
              ) : (
                <div style={{ color: '#2B5949', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Check size={14} color="#3F7965" />
                  <span>Authorized & Dispatched</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stock Reserves */}
      <div style={{
        backgroundColor: '#FFFEFA',
        border: '1px solid #DCD7CC',
        borderRadius: 6,
        padding: 18
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1D252A', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
          Regional Stockpiles & Safety Margins
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {situation.inventory.map(item => (
            <div key={item.id} style={{
              backgroundColor: '#F4F1EA',
              border: item.status === 'CRITICAL_SHORTAGE' ? '1px solid #B83D38' : '1px solid #DCD7CC',
              borderRadius: 6,
              padding: 14
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: '#1D252A', fontSize: 13, fontFamily: 'var(--font-heading)' }}>
                  {item.name}
                </span>
                <span className={item.status === 'CRITICAL_SHORTAGE' ? 'badge-severe' : item.status === 'LOW_STOCK' ? 'badge-caution' : 'badge-safe'}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#5A656E' }}>
                On Hand: <strong style={{ color: '#1D252A' }}>{item.quantity.toLocaleString()} {item.unit}</strong>
              </div>
              <div style={{ fontSize: 11.5, color: '#83909C' }}>
                Safety Threshold: {item.min_threshold.toLocaleString()} {item.unit}
              </div>
              <div style={{ fontSize: 11, color: '#2458A6', marginTop: 4 }}>
                Depot: {item.depot_location}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
