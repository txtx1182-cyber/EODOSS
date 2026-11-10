import React, { useState, useEffect } from 'react';
import { X, Play, Activity } from 'lucide-react';
import { API } from '../api';

interface SimulationResult {
  seed: number;
  engine: {
    tasks: number;
    assigned: number;
    unassigned: number;
    coverage_pct: number;
    need_weighted_eta_min: number;
    units_used: number;
  };
  baseline: {
    tasks: number;
    assigned: number;
    unassigned: number;
    coverage_pct: number;
    need_weighted_eta_min: number;
    units_used: number;
  };
  eta_improvement_pct: number;
  coverage_delta_pct: number;
}

interface ScaleTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScaleTestModal: React.FC<ScaleTestModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(7);

  const fetchSimulation = async (s: number = 7) => {
    setLoading(true);
    try {
      const res = await fetch(API(`engine/simulation?seed=${s}`));
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch scale test simulation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSimulation(seed);
    }
  }, [isOpen, seed]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(29, 37, 42, 0.45)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        backgroundColor: '#FFFEFA',
        border: '1px solid #DCD7CC',
        borderRadius: 8,
        width: '100%',
        maxWidth: 620,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #DCD7CC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8F6F0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={18} color="#2458A6" />
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#1D252A' }}>
                Multi-Agent Headless Scale Comparison
              </h3>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: '#7C2D12',
                marginTop: 2
              }}>
                Synthetic scenario · seed 7 · 6 zones, 5 incidents, 10 units
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#5A656E',
              padding: 4
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20 }}>
          {loading && !data ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#5A656E', fontFamily: 'var(--font-heading)' }}>
              Executing headless allocation simulation...
            </div>
          ) : data ? (
            <div>
              {/* Headline Numbers Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 6,
                  padding: '12px 16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                    Need-Weighted ETA Improvement
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#047857', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    +{data.eta_improvement_pct}%
                  </div>
                  <div style={{ fontSize: 11, color: '#065F46', marginTop: 2 }}>
                    Faster response to high-priority zones
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(36, 88, 166, 0.08)',
                  border: '1px solid rgba(36, 88, 166, 0.3)',
                  borderRadius: 6,
                  padding: '12px 16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                    Coverage Delta
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#1D4ED8', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    +{data.coverage_delta_pct} pp
                  </div>
                  <div style={{ fontSize: 11, color: '#1E40AF', marginTop: 2 }}>
                    More survivors reached within depot constraints
                  </div>
                </div>
              </div>

              {/* Baseline vs Engine Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12.5,
                fontFamily: 'var(--font-mono)'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #DCD7CC', textAlign: 'left', backgroundColor: '#F4F1EA' }}>
                    <th style={{ padding: '8px 10px', color: '#1D252A', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      Metric
                    </th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: '#5A656E', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      Baseline (Nearest Unit)
                    </th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: '#065F46', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      Engine (Need + Access Aware)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px 10px', color: '#1D252A', fontWeight: 600 }}>Tasks</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{data.baseline.tasks}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#065F46' }}>{data.engine.tasks}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px 10px', color: '#1D252A', fontWeight: 600 }}>Assigned</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{data.baseline.assigned}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#065F46' }}>{data.engine.assigned}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px 10px', color: '#1D252A', fontWeight: 600 }}>Unassigned</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{data.baseline.unassigned}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#065F46' }}>{data.engine.unassigned}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px 10px', color: '#1D252A', fontWeight: 600 }}>Coverage (%)</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{data.baseline.coverage_pct.toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#065F46' }}>{data.engine.coverage_pct.toFixed(1)}%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px 10px', color: '#1D252A', fontWeight: 600 }}>Need-Weighted ETA (min)</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{data.baseline.need_weighted_eta_min.toFixed(1)} m</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#065F46' }}>{data.engine.need_weighted_eta_min.toFixed(1)} m</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', color: '#1D252A', fontWeight: 600 }}>Units Used</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{data.baseline.units_used}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#065F46' }}>{data.engine.units_used}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{
                marginTop: 16,
                padding: '8px 12px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 4,
                fontSize: 11,
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Evaluated on identical ground-truth travel times via haversine & corridor accessibility.</span>
                <button
                  onClick={() => fetchSimulation(seed)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    fontSize: 11,
                    fontFamily: 'var(--font-heading)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DCD7CC',
                    borderRadius: 4,
                    cursor: 'pointer',
                    color: '#1D252A'
                  }}
                >
                  <Play size={10} />
                  <span>Re-run</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: '#B83D38', textAlign: 'center', padding: 20 }}>
              Failed to load benchmark data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
