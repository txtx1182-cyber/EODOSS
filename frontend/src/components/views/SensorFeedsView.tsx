import React from 'react';
import { SharedSituationModel } from '../../types/situation';
import { Activity, Radio, Satellite, Eye, Waves } from 'lucide-react';

interface SensorFeedsViewProps {
  situation: SharedSituationModel;
}

export const SensorFeedsView: React.FC<SensorFeedsViewProps> = ({ situation }) => {
  return (
    <div style={{
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      height: '100%',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #263244',
        paddingBottom: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="#10B981" />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>
            HYDROLOGICAL, RADAR & SATELLITE PREDICTION INPUTS
          </h2>
        </div>
        <span style={{ fontSize: 10, color: '#10B981', fontFamily: 'monospace' }}>
          MULTI-SENSOR CORROBORATION ENGINE
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
        {situation.recent_inputs.map(input => (
          <div key={input.id} style={{
            backgroundColor: '#121820',
            border: '1px solid #263244',
            padding: 12,
            borderRadius: 2
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span className="font-mono" style={{ color: '#0284C7', fontWeight: 700, fontSize: 11 }}>
                {input.source_type} // {input.source_id}
              </span>
              <span style={{
                backgroundColor: 'rgba(21, 128, 61, 0.2)',
                color: '#10B981',
                border: '1px solid #15803D',
                fontSize: 8.5,
                padding: '1px 5px',
                fontFamily: 'monospace'
              }}>
                {input.status}
              </span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>
              {input.metric_name}
            </div>

            <div style={{
              backgroundColor: '#0B0F14',
              border: '1px solid #263244',
              padding: '8px 10px',
              margin: '6px 0',
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#F87171'
            }}>
              {input.reading_value}
            </div>

            <div style={{ fontSize: 10, color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Location: {input.location_desc}</span>
              <span className="font-mono">{input.freshness_min}m freshness // {input.confidence_pct}% conf</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

