import React from 'react';
import { DerivedState, PredictionInput } from '../types/situation';

interface EvidenceChipsProps {
  zoneId: string;
  derived?: DerivedState | null;
  recentInputs?: PredictionInput[];
  compact?: boolean;
}

export const EvidenceChips: React.FC<EvidenceChipsProps> = ({
  zoneId,
  derived,
  recentInputs = [],
  compact = false
}) => {
  const zoneScore = derived?.zones?.[zoneId];
  if (!zoneScore) return null;

  const access = zoneScore.access ?? 0;
  const accessColor = access >= 0.7 ? 'var(--color-grounded, #10b981)' : access >= 0.4 ? 'var(--color-conflict, #f59e0b)' : 'var(--color-severe, #ef4444)';
  const routeNote = zoneScore.evidence?.route?.note || `Access ${(access * 100).toFixed(0)}%`;

  const conf = zoneScore.confidence_pct ?? 0;
  const comps = zoneScore.evidence?.confidence?.components;
  const confTooltip = comps
    ? `Confidence Breakdown:\n• Mean Confidence: ${(comps.mean_confidence * 100).toFixed(0)}%\n• Staleness: ${(comps.staleness * 100).toFixed(0)}%\n• Agreement: ${(comps.agreement * 100).toFixed(0)}%\n• Recency: ${(comps.recency * 100).toFixed(0)}%\n• Completeness: ${(comps.completeness * 100).toFixed(0)}%`
    : `Confidence: ${conf}%`;

  const isLive = recentInputs.some(
    inp => (inp.zone_id === zoneId || inp.location_desc?.toLowerCase().includes(zoneId.toLowerCase()))
      && inp.source_id === 'open-meteo'
      && inp.freshness_min < 30
  );

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: compact ? 2 : 4
    }}>
      {/* Route Access Chip */}
      <span
        title={`Corridor Access: ${(access * 100).toFixed(1)}% (${routeNote})`}
        style={{
          fontSize: 10,
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          padding: '2px 6px',
          borderRadius: 4,
          backgroundColor: '#1E293B',
          color: accessColor,
          border: `1px solid ${accessColor}40`,
          cursor: 'help'
        }}
      >
        RT {access < 0.4 ? '⚠ ' : ''}{(access * 100).toFixed(0)}%
      </span>

      {/* Confidence Breakdown Chip */}
      <span
        title={confTooltip}
        style={{
          fontSize: 10,
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          padding: '2px 6px',
          borderRadius: 4,
          backgroundColor: '#1E293B',
          color: conf >= 55 ? 'var(--color-grounded, #10b981)' : 'var(--color-conflict, #f59e0b)',
          border: `1px solid ${conf >= 55 ? '#10b98140' : '#f59e0b40'}`,
          cursor: 'help'
        }}
      >
        CONF {conf.toFixed(0)}%
      </span>

      {/* Source Status Pill */}
      <span
        title={isLive ? 'Live Open-Meteo precipitation ingest (<30m fresh)' : 'Synthetic / Seeded Simulation Scenario'}
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          fontFamily: 'var(--font-heading, sans-serif)',
          padding: '2px 6px',
          borderRadius: 10,
          backgroundColor: isLive ? '#065F46' : '#334155',
          color: isLive ? '#34D399' : '#CBD5E1',
          border: isLive ? '1px solid #10B981' : '1px solid #475569',
          letterSpacing: '0.04em'
        }}
      >
        {isLive ? '● LIVE' : 'Seeded'}
      </span>
    </div>
  );
};
