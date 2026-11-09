import React from 'react';
import { SharedSituationModel } from '../../types/situation';
import { Plane } from 'lucide-react';

interface SwarmViewProps {
  situation: SharedSituationModel;
  onDispatchRecon: () => void;
  onExecuteCargoDrop: (missionId: string) => void;
}

export const SwarmView: React.FC<SwarmViewProps> = ({ situation }) => {
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
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Plane size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1D252A', margin: 0, fontFamily: 'var(--font-heading)' }}>
              E-SWARM — Aerial Reconnaissance & Cargo Fleet
            </h2>
            <div style={{ fontSize: 12, color: '#5A656E' }}>
              Uncrewed aerial vehicles for optical assessment, breach verification, and medical air-drops
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {situation.drones.map(drone => {
          const isScout = drone.role === 'E-SCOUT';
          const isPartitioned = drone.mesh_status === 'NO_UPLINK';

          return (
            <div
              key={drone.id}
              style={{
                backgroundColor: '#FFFEFA',
                border: isPartitioned ? '1px solid #B83D38' : '1px solid #DCD7CC',
                borderRadius: 6,
                padding: 18,
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    backgroundColor: isScout ? '#0284C7' : '#EA580C',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 4,
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {drone.role}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1D252A', fontFamily: 'var(--font-heading)' }}>
                    {drone.callsign}
                  </span>
                </div>

                <span className={drone.status === 'STANDBY' ? 'badge-safe' : 'badge-caution'}>
                  {drone.status}
                </span>
              </div>

              {/* Specs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '12px 0', fontSize: 12 }}>
                <div style={{ backgroundColor: '#F4F1EA', border: '1px solid #DCD7CC', borderRadius: 4, padding: '8px 10px' }}>
                  <div style={{ color: '#5A656E', fontSize: 11 }}>Battery Level</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    color: drone.battery_pct < 40 ? '#992B26' : '#2B5949',
                    fontWeight: 700,
                    fontSize: 13
                  }}>
                    {drone.battery_pct}%
                  </div>
                </div>

                <div style={{ backgroundColor: '#F4F1EA', border: '1px solid #DCD7CC', borderRadius: 4, padding: '8px 10px' }}>
                  <div style={{ color: '#5A656E', fontSize: 11 }}>Payload</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: '#1D252A', fontWeight: 700, fontSize: 13 }}>
                    {drone.current_payload_kg} / {drone.payload_capacity_kg} kg
                  </div>
                </div>

                <div style={{ backgroundColor: '#F4F1EA', border: '1px solid #DCD7CC', borderRadius: 4, padding: '8px 10px' }}>
                  <div style={{ color: '#5A656E', fontSize: 11 }}>Mesh Uplink</div>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    color: isPartitioned ? '#992B26' : '#2B5949',
                    fontWeight: 600,
                    fontSize: 12
                  }}>
                    {drone.mesh_status}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F4F1EA', border: '1px solid #DCD7CC', borderRadius: 4, padding: '8px 10px' }}>
                  <div style={{ color: '#5A656E', fontSize: 11 }}>Signal RSSI</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: '#5A656E', fontSize: 12 }}>
                    {drone.mesh_rssi_dbm} dBm
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11.5, color: '#5A656E' }}>
                Base Station: <strong>{drone.station_id}</strong>
              </div>

              {isPartitioned && (
                <div style={{
                  backgroundColor: '#FBECEB',
                  border: '1px solid rgba(184, 61, 56, 0.3)',
                  color: '#992B26',
                  fontSize: 11.5,
                  borderRadius: 4,
                  padding: '6px 10px',
                  marginTop: 10
                }}>
                  Communication link lost. Onboard autonomous return protocol active.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
