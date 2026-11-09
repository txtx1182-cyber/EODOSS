import React from 'react';
import { SharedSituationModel } from '../../types/situation';
import { LifeBuoy, Anchor, Users, Check } from 'lucide-react';

interface ResqViewProps {
  situation: SharedSituationModel;
  onApproveMission: (missionId: string) => void;
}

export const ResqView: React.FC<ResqViewProps> = ({ situation, onApproveMission }) => {
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
      {/* View Header */}
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
            backgroundColor: '#2458A6',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LifeBuoy size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1D252A', margin: 0, fontFamily: 'var(--font-heading)' }}>
              E-RESQ — Rescue & Evacuation Operations
            </h2>
            <div style={{ fontSize: 12, color: '#5A656E' }}>
              Amphibious water rescue units, target tracking, and emergency shelter allocations
            </div>
          </div>
        </div>
      </div>

      {/* Target Incidents Table */}
      <div style={{
        backgroundColor: '#FFFEFA',
        border: '1px solid #DCD7CC',
        borderRadius: 6,
        padding: 18,
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1D252A', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
          Identified Rescue Targets & Stranded Persons
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {situation.incidents.map(inc => (
            <div key={inc.id} style={{
              backgroundColor: '#F4F1EA',
              border: inc.status === 'VERIFIED_TARGET' ? '1px solid #B83D38' : '1px solid #DCD7CC',
              borderRadius: 6,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1D252A', fontFamily: 'var(--font-heading)' }}>
                    {inc.id}: {inc.title}
                  </span>
                  <span className={inc.status === 'VERIFIED_TARGET' ? 'badge-severe' : 'badge-caution'}>
                    {inc.status === 'VERIFIED_TARGET' ? 'Verified Target' : 'Suspected Incident'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#5A656E', marginTop: 4 }}>
                  Estimated Count: <strong>{inc.estimated_count} persons</strong> · Sector: {inc.zone_id} · Observation Source: {inc.source_drone_id || 'Ground Report'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#2B5949', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {inc.confidence_pct}% Confidence
                </span>
                <div style={{ fontSize: 11, color: '#5A656E', marginTop: 2 }}>
                  {inc.verified_by ? `Verified by ${inc.verified_by}` : 'Pending Aerial Re-verification'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rescue Teams and Boats Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          backgroundColor: '#FFFEFA',
          border: '1px solid #DCD7CC',
          borderRadius: 6,
          padding: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Anchor size={16} color="#2458A6" />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1D252A', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Amphibious Rescue Boat Fleet
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {situation.resources.filter(r => r.kind === 'RESCUE_BOAT').map(boat => (
              <div key={boat.id} style={{ backgroundColor: '#F4F1EA', border: '1px solid #DCD7CC', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#1D252A', fontSize: 12.5, fontFamily: 'var(--font-heading)' }}>
                    {boat.name}
                  </span>
                  <span className={boat.status === 'AVAILABLE' ? 'badge-safe' : 'badge-caution'}>
                    {boat.status}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: '#5A656E', marginTop: 4 }}>
                  Capacity: {boat.capacity_persons} persons · Slipway: {boat.station_location}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFEFA',
          border: '1px solid #DCD7CC',
          borderRadius: 6,
          padding: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Users size={16} color="#2458A6" />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1D252A', margin: 0, fontFamily: 'var(--font-heading)' }}>
              NDRF & Specialized Field Units
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {situation.resources.filter(r => r.kind !== 'RESCUE_BOAT').map(res => (
              <div key={res.id} style={{ backgroundColor: '#F4F1EA', border: '1px solid #DCD7CC', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#1D252A', fontSize: 12.5, fontFamily: 'var(--font-heading)' }}>
                    {res.name}
                  </span>
                  <span className={res.status === 'AVAILABLE' ? 'badge-safe' : 'badge-caution'}>
                    {res.status}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: '#5A656E', marginTop: 4 }}>
                  {res.kind.replace('_', ' ')} · Base: {res.station_location} · Roster: {res.capacity_persons}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
