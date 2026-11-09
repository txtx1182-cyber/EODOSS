import React, { useState } from 'react';
import { SharedSituationModel } from '../types/situation';
import { Activity, Shield, Users, Warehouse, Package, Terminal } from 'lucide-react';

interface BottomRackTelemetryProps {
  situation: SharedSituationModel;
}

export const BottomRackTelemetry: React.FC<BottomRackTelemetryProps> = ({ situation }) => {
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'TEAMS' | 'SHELTERS' | 'INVENTORY'>('EVENTS');

  return (
    <div style={{
      height: 180,
      backgroundColor: '#121820',
      borderTop: '1px solid #263244',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Sensor Ticker Strip */}
      <div style={{
        height: 24,
        backgroundColor: '#0B0F14',
        borderBottom: '1px solid #263244',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 16,
        fontSize: 9.5,
        fontFamily: 'monospace',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={11} color="#10B981" />
          <span style={{ color: '#94A3B8' }}>LIVE TELEMETRY STREAM:</span>
        </div>

        {situation.recent_inputs.map(inp => (
          <div key={inp.id} style={{ display: 'flex', gap: 6, color: '#E2E8F0' }}>
            <span style={{ color: '#0284C7' }}>[{inp.source_type}]:</span>
            <span>{inp.metric_name}: <strong>{inp.reading_value}</strong></span>
            <span style={{ color: '#64748B' }}>({inp.freshness_min}m ago // {inp.confidence_pct}% conf)</span>
            <span style={{ color: '#263244' }}>|</span>
          </div>
        ))}
      </div>

      {/* Tabs Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #263244',
        backgroundColor: '#121820',
        padding: '0 10px'
      }}>
        {[
          { id: 'EVENTS', label: 'OPERATIONAL EVENT FEED', icon: Terminal, count: situation.audit_log.length },
          { id: 'TEAMS', label: 'FIELD TEAMS & BOATS', icon: Users, count: situation.resources.length },
          { id: 'SHELTERS', label: 'RELIEF SHELTERS', icon: Warehouse, count: situation.shelters.length },
          { id: 'INVENTORY', label: 'SUPPLY STOCK & SHORTAGES', icon: Package, count: situation.inventory.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                backgroundColor: isActive ? '#18202C' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #2458A6' : '2px solid transparent',
                color: isActive ? '#E2E8F0' : '#94A3B8',
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              <Icon size={12} color={isActive ? '#60A5FA' : '#64748B'} />
              <span>{tab.label}</span>
              <span style={{
                backgroundColor: '#0B0F14',
                color: '#64748B',
                fontSize: 9,
                padding: '1px 5px',
                borderRadius: 2
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px', fontSize: 10 }}>
        {activeTab === 'EVENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {situation.audit_log.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '4px 6px',
                  borderBottom: '1px solid #18202C'
                }}
                className="tactical-row"
              >
                <span className="font-mono" style={{ color: '#64748B', fontSize: 9 }}>
                  {item.timestamp.slice(11, 19)}
                </span>
                <span style={{
                  backgroundColor: '#0B0F14',
                  border: '1px solid #263244',
                  color: '#0284C7',
                  padding: '1px 5px',
                  fontSize: 8.5,
                  fontWeight: 600,
                  fontFamily: 'monospace'
                }}>
                  {item.source_module}
                </span>
                <span className="font-mono" style={{ color: '#E2E8F0', fontWeight: 600 }}>
                  {item.action}
                </span>
                <span style={{ color: '#94A3B8', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {item.details}
                </span>
                <span className="font-mono" style={{ color: '#10B981', fontSize: 9 }}>
                  {item.confidence_pct}% CONF
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'TEAMS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {situation.resources.map(res => (
              <div key={res.id} style={{ backgroundColor: '#0B0F14', border: '1px solid #263244', padding: '6px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span className="font-mono" style={{ fontWeight: 600, color: '#E2E8F0' }}>{res.name}</span>
                  <span style={{
                    color: res.status === 'AVAILABLE' ? '#10B981' : '#D97706',
                    fontFamily: 'monospace',
                    fontSize: 9
                  }}>
                    {res.status}
                  </span>
                </div>
                <div style={{ color: '#64748B', fontSize: 9.5 }}>
                  {res.kind} // Station: {res.station_location} // Capacity: {res.capacity_persons} pers
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SHELTERS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {situation.shelters.map(sh => (
              <div key={sh.id} style={{ backgroundColor: '#0B0F14', border: '1px solid #263244', padding: '6px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span className="font-mono" style={{ fontWeight: 600, color: '#E2E8F0' }}>{sh.name}</span>
                  <span className="font-mono" style={{
                    color: sh.safe_margin < 20 ? '#EF4444' : '#0ebe83ff',
                    fontSize: 9
                  }}>
                    {sh.occupancy} / {sh.capacity} ({sh.safe_margin} left)
                  </span>
                </div>
                <div style={{ color: '#94A3B8', fontSize: 9.5 }}>
                  Food: {sh.food_days_remaining}d // Water: {sh.water_liters}L // Doctors: {sh.doctors_present}
                </div>
                <div style={{ color: sh.medical_need.includes('CRITICAL') || sh.medical_need.includes('URGENT') ? '#F87171' : '#64748B', fontSize: 9, marginTop: 2 }}>
                  Med Status: {sh.medical_need}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'INVENTORY' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {situation.inventory.map(stk => (
              <div key={stk.id} style={{
                backgroundColor: '#0B0F14',
                border: stk.status === 'CRITICAL_SHORTAGE' ? '1px solid #DC2626' : '1px solid #263244',
                padding: '6px 10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span className="font-mono" style={{ fontWeight: 600, color: '#E2E8F0' }}>{stk.name}</span>
                  <span style={{
                    color: stk.status === 'CRITICAL_SHORTAGE' ? '#EF4444' : stk.status === 'LOW_STOCK' ? '#D97706' : '#10B981',
                    fontFamily: 'monospace',
                    fontSize: 9
                  }}>
                    {stk.status}
                  </span>
                </div>
                <div style={{ color: '#94A3B8', fontSize: 9.5 }}>
                  Qty: <strong>{stk.quantity} {stk.unit}</strong> (Min Safety Threshold: {stk.min_threshold})
                </div>
                <div style={{ color: '#64748B', fontSize: 9 }}>
                  Location: {stk.depot_location}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
