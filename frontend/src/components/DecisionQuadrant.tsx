import React from 'react';
import { DerivedState, DerivedZone } from '../types/situation';

interface DecisionQuadrantProps {
  derived?: DerivedState | null;
  onSelectZone?: (zoneId: string) => void;
}

export const DecisionQuadrant: React.FC<DecisionQuadrantProps> = ({ derived, onSelectZone }) => {
  if (!derived || !derived.zones) return null;

  const zonesList: DerivedZone[] = Object.values(derived.zones);

  // Group zones strictly by the API-derived 'action' field (thresholds live on backend)
  const dispatchZones = zonesList
    .filter(z => z.action === 'DISPATCH')
    .sort((a, b) => b.need - a.need);

  const verifyZones = zonesList
    .filter(z => z.action === 'VERIFY_THEN_DISPATCH')
    .sort((a, b) => b.need - a.need);

  const monitorZones = zonesList
    .filter(z => z.action === 'MONITOR')
    .sort((a, b) => b.need - a.need);

  const reconZones = zonesList
    .filter(z => z.action === 'RECON')
    .sort((a, b) => b.need - a.need);

  const renderZoneTags = (zones: DerivedZone[]) => {
    if (zones.length === 0) {
      return (
        <span style={{ fontSize: 11, color: '#88939D', fontStyle: 'italic' }}>
          None
        </span>
      );
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {zones.map(z => (
          <span
            key={z.zone_id}
            onClick={() => onSelectZone && onSelectZone(z.zone_id)}
            title={`${z.name} | Need: ${z.need.toFixed(1)} | Conf: ${z.confidence_pct.toFixed(1)}% | Access: ${z.access.toFixed(2)}`}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              fontWeight: 700,
              padding: '2px 6px',
              backgroundColor: '#FFFEFA',
              border: '1px solid #DCD7CC',
              borderRadius: 3,
              cursor: onSelectZone ? 'pointer' : 'default',
              color: '#1D252A'
            }}
          >
            {z.zone_id}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      className="decision-quadrant-card"
      style={{
        backgroundColor: '#FFFEFA',
        border: '1px solid #DCD7CC',
        borderRadius: 6,
        padding: '12px 14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        marginBottom: 4
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 11.5,
          fontWeight: 700,
          color: '#1D252A',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          Decision Quadrant (2×2 Engine)
        </span>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: '#5A656E'
        }}>
          API Action Rules
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr 1fr',
        gap: 6,
        fontSize: 10,
        fontFamily: 'var(--font-heading)'
      }}>
        {/* Header Row */}
        <div></div>
        <div style={{
          textAlign: 'center',
          fontWeight: 700,
          color: '#4B5563',
          padding: '2px 0',
          borderBottom: '1px solid #E5E7EB',
          fontSize: 9.5
        }}>
          HIGH CONFIDENCE
        </div>
        <div style={{
          textAlign: 'center',
          fontWeight: 700,
          color: '#4B5563',
          padding: '2px 0',
          borderBottom: '1px solid #E5E7EB',
          fontSize: 9.5
        }}>
          LOW CONFIDENCE
        </div>

        {/* Row 1: HIGH NEED */}
        <div style={{
          fontWeight: 700,
          color: '#4B5563',
          display: 'flex',
          alignItems: 'center',
          fontSize: 9.5
        }}>
          HIGH NEED
        </div>

        {/* Quadrant: DISPATCH */}
        <div
          data-action="DISPATCH"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 4,
            padding: '6px 8px',
            minHeight: 52
          }}
        >
          <div style={{
            fontWeight: 800,
            fontSize: 10,
            color: '#065F46',
            marginBottom: 4,
            letterSpacing: '0.02em'
          }}>
            DISPATCH
          </div>
          {renderZoneTags(dispatchZones)}
        </div>

        {/* Quadrant: VERIFY, THEN DISPATCH */}
        <div
          data-action="VERIFY_THEN_DISPATCH"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 4,
            padding: '6px 8px',
            minHeight: 52
          }}
        >
          <div style={{
            fontWeight: 800,
            fontSize: 10,
            color: '#92400E',
            marginBottom: 4,
            letterSpacing: '0.02em'
          }}>
            VERIFY, THEN DISPATCH
          </div>
          {renderZoneTags(verifyZones)}
        </div>

        {/* Row 2: LOW NEED */}
        <div style={{
          fontWeight: 700,
          color: '#4B5563',
          display: 'flex',
          alignItems: 'center',
          fontSize: 9.5
        }}>
          LOW NEED
        </div>

        {/* Quadrant: MONITOR */}
        <div
          data-action="MONITOR"
          style={{
            backgroundColor: 'rgba(100, 116, 139, 0.06)',
            border: '1px solid rgba(100, 116, 139, 0.25)',
            borderRadius: 4,
            padding: '6px 8px',
            minHeight: 52
          }}
        >
          <div style={{
            fontWeight: 800,
            fontSize: 10,
            color: '#334155',
            marginBottom: 4,
            letterSpacing: '0.02em'
          }}>
            MONITOR
          </div>
          {renderZoneTags(monitorZones)}
        </div>

        {/* Quadrant: RECON IF SPARE */}
        <div
          data-action="RECON"
          style={{
            backgroundColor: 'rgba(168, 85, 247, 0.07)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 4,
            padding: '6px 8px',
            minHeight: 52
          }}
        >
          <div style={{
            fontWeight: 800,
            fontSize: 10,
            color: '#6B21A8',
            marginBottom: 4,
            letterSpacing: '0.02em'
          }}>
            RECON IF SPARE
          </div>
          {renderZoneTags(reconZones)}
        </div>
      </div>
    </div>
  );
};
