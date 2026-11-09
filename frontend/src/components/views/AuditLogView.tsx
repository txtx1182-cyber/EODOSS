import React, { useState } from 'react';
import { SharedSituationModel } from '../../types/situation';
import { ScrollText } from 'lucide-react';

interface AuditLogViewProps {
  situation: SharedSituationModel;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ situation }) => {
  const [filterModule, setFilterModule] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = situation.audit_log.filter(item => {
    if (filterModule !== 'ALL' && item.source_module !== filterModule) return false;
    if (searchQuery && !item.details.toLowerCase().includes(searchQuery.toLowerCase()) && !item.action.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
            backgroundColor: '#2458A6',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ScrollText size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1D252A', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Operational Audit Trail
            </h2>
            <div style={{ fontSize: 12, color: '#5A656E' }}>
              Immutable record of system alerts, authority authorizations, and tactical dispatches
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'AUTHORITY', 'ORCHESTRATOR', 'E-RESQ', 'E-SUPP', 'E-SWARM', 'PREDICTION'].map(mod => (
            <button
              key={mod}
              onClick={() => setFilterModule(mod)}
              style={{
                backgroundColor: filterModule === mod ? '#2458A6' : '#FFFEFA',
                border: filterModule === mod ? '1px solid #2458A6' : '1px solid #DCD7CC',
                color: filterModule === mod ? '#FFFFFF' : '#1D252A',
                padding: '6px 12px',
                fontSize: 12,
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 6,
                transition: 'background-color 0.15s ease'
              }}
            >
              {mod}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter audit records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: '#FFFEFA',
            border: '1px solid #DCD7CC',
            borderRadius: 6,
            color: '#1D252A',
            padding: '7px 12px',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'var(--font-body)'
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: '#FFFEFA',
        border: '1px solid #DCD7CC',
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#F4F1EA', borderBottom: '1px solid #DCD7CC', color: '#5A656E', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: 11.5 }}>
              <th style={{ padding: '10px 14px', width: 110 }}>Timestamp</th>
              <th style={{ padding: '10px 14px', width: 120 }}>Module</th>
              <th style={{ padding: '10px 14px', width: 180 }}>Action</th>
              <th style={{ padding: '10px 14px' }}>Details & Evidence</th>
              <th style={{ padding: '10px 14px', width: 120 }}>Operator</th>
              <th style={{ padding: '10px 14px', width: 90, textAlign: 'right' }}>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr
                key={log.id}
                style={{
                  borderBottom: '1px solid #F4F1EA',
                  color: '#1D252A'
                }}
              >
                <td style={{ padding: '10px 14px', color: '#5A656E', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {formatIST(log.timestamp)}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    backgroundColor: '#F4F1EA',
                    border: '1px solid #DCD7CC',
                    color: '#2458A6',
                    padding: '2px 7px',
                    fontSize: 10.5,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    borderRadius: 3
                  }}>
                    {log.source_module}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: 12.5 }}>
                  {log.action}
                </td>
                <td style={{ padding: '10px 14px', color: '#1D252A', lineHeight: 1.4 }}>
                  {log.details}
                </td>
                <td style={{ padding: '10px 14px', color: '#5A656E', fontSize: 12 }}>
                  {log.user_id || 'System'}
                </td>
                <td style={{ padding: '10px 14px', color: '#2B5949', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {log.confidence_pct ? `${log.confidence_pct}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
