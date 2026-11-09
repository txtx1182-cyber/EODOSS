import React, { useState, useEffect } from 'react';
import { RotateCcw, User, Shield, Clock } from 'lucide-react';

interface TopCommandBarProps {
  onReset: () => void;
  user: { name: string; role: string; station: string };
  onLogout: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  onReset,
  user
}) => {
  const [istStr, setIstStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstStr(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      backgroundColor: '#FFFEFA',
      borderBottom: '1px solid #DCD7CC',
      padding: '0 20px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 30,
      flexShrink: 0
    }}>
      {/* Left: Official Emblem Icon + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 6,
          backgroundColor: '#2458A6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF'
        }}>
          <Shield size={18} />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            fontWeight: 700,
            color: '#1D252A',
            letterSpacing: '-0.01em',
            margin: 0
          }}>
            EODOSS — Regional Disaster Operations & Decision Support
          </h1>
          <div style={{
            fontSize: 12,
            color: '#5A656E',
            fontFamily: 'var(--font-body)',
            marginTop: 1
          }}>
            District Disaster Management Authority · Kamrup Metropolitan (Guwahati)
          </div>
        </div>
      </div>

      {/* Right Controls: Officer Pill, Clock, Simulation Pill, Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Simulation Badge */}
        <div style={{
          backgroundColor: '#FDF6E9',
          border: '1px solid rgba(201, 136, 38, 0.3)',
          color: '#9A6514',
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'var(--font-heading)',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#C98826' }} />
          <span>Training Simulation · Seeded Scenario</span>
        </div>

        {/* Single IST Clock Pill */}
        <div style={{
          backgroundColor: '#F4F1EA',
          border: '1px solid #DCD7CC',
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: 12,
          color: '#1D252A',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Clock size={13} color="#5A656E" />
          <span>{istStr}</span>
        </div>

        {/* Officer Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#F4F1EA',
          border: '1px solid #DCD7CC',
          borderRadius: 20,
          padding: '3px 12px',
          fontSize: 12.5
        }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: '#2458A6',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={12} />
          </div>
          <span style={{ color: '#1D252A', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
            {user.name}
          </span>
          <span style={{ color: '#5A656E' }}>·</span>
          <span style={{ color: '#5A656E' }}>Local Authority</span>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          title="Reset scenario state"
          style={{
            backgroundColor: '#FFFEFA',
            border: '1px solid #DCD7CC',
            color: '#5A656E',
            padding: '5px 10px',
            fontSize: 12,
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
          className="civic-button-secondary"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
