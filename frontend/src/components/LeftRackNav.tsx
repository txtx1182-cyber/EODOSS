import React from 'react';
import { Map, LifeBuoy, Truck, Plane, ScrollText, ListFilter, Users, Warehouse, Package } from 'lucide-react';
import { BoardType } from './TacticalModalBoards';

interface LeftRackNavProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenBoard: (board: BoardType) => void;
  eventsCount: number;
  teamsCount: number;
  sheltersCount: number;
  stockCount: number;
}

export const LeftRackNav: React.FC<LeftRackNavProps> = ({
  currentView,
  onSelectView,
  onOpenBoard,
  eventsCount,
  teamsCount,
  sheltersCount,
  stockCount
}) => {
  const primaryWorkspaces = [
    { id: 'OVERVIEW', label: 'Situation Map', icon: Map },
    { id: 'E_RESQ', label: 'E-RESQ · Rescue & Evacuation', icon: LifeBuoy },
    { id: 'E_SUPP', label: 'E-SUPP · Relief & Medical Logistics', icon: Truck },
    { id: 'E_SWARM', label: 'E-SWARM · Aerial Assessment', icon: Plane },
    { id: 'AUDIT', label: 'Audit Trail', icon: ScrollText }
  ];

  const operationalBoards = [
    { id: 'EVENTS' as const, label: 'Event Log', icon: ListFilter, count: eventsCount },
    { id: 'TEAMS' as const, label: 'Field Teams & Boats', icon: Users, count: teamsCount },
    { id: 'SHELTERS' as const, label: 'Relief Centers', icon: Warehouse, count: sheltersCount },
    { id: 'INVENTORY' as const, label: 'Supply & Mutual Aid', icon: Package, count: stockCount }
  ];

  return (
    <aside style={{
      width: 250,
      height: '100%',
      backgroundColor: '#F4F1EA',
      borderRight: '1px solid #DCD7CC',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '16px 12px',
      overflowY: 'auto'
    }}>
      {/* Section 1: Primary Workspaces */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          color: '#5A656E',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 8,
          paddingLeft: 8
        }}>
          Workspaces
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {primaryWorkspaces.map(w => {
            const Icon = w.icon;
            const isActive = currentView === w.id;

            return (
              <button
                key={w.id}
                onClick={() => onSelectView(w.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  backgroundColor: isActive ? '#EAE4D7' : 'transparent',
                  color: isActive ? '#1D252A' : '#5A656E',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isActive ? 600 : 500,
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#2458A6' : '#5A656E'} />
                <span>{w.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Section 2: Operational Boards (Modal triggers) */}
      <div>
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          color: '#5A656E',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 8,
          paddingLeft: 8
        }}>
          Operational Boards
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {operationalBoards.map(b => {
            const Icon = b.icon;

            return (
              <button
                key={b.id}
                onClick={() => onOpenBoard(b.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: '#FFFEFA',
                  border: '1px solid #DCD7CC',
                  color: '#1D252A',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 500,
                  textAlign: 'left',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                className="civic-button-secondary"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Icon size={15} color="#2458A6" />
                  <span>{b.label}</span>
                </div>
                <span style={{
                  backgroundColor: '#F4F1EA',
                  color: '#5A656E',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 10
                }}>
                  {b.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Authority Control Footer Note */}
      <div style={{
        marginTop: 'auto',
        padding: '12px 10px',
        borderTop: '1px solid #DCD7CC',
        fontSize: 11,
        color: '#5A656E',
        fontFamily: 'var(--font-body)',
        lineHeight: 1.4
      }}>
        <div style={{ fontWeight: 600, color: '#1D252A', fontFamily: 'var(--font-heading)' }}>
          State EOC Node
        </div>
        <div>Assam State Disaster Management Authority (ASDMA) · Verified secure session</div>
      </div>
    </aside>
  );
};
