import React, { useState } from 'react';
import { Shield, KeyRound, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TacticalLoginProps {
  onSuccess: (user: { name: string; role: string; station: string }) => void;
}

export const TacticalLogin: React.FC<TacticalLoginProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('demo@eodoss.gov.in');
  const [password, setPassword] = useState('eodoss2026');
  const [verificationCode, setVerificationCode] = useState('');
  const [role, setRole] = useState('LOCAL_AUTHORITY');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if ((identifier === 'demo@eodoss.gov.in' && password === 'eodoss2026') || (identifier === 'judge' && password === 'demo')) {
      setStep(2);
      setVerificationCode('742918');
    } else {
      setError('Authentication failed: Invalid authority credentials.');
    }
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);
    setTimeout(() => {
      if (['742918', '999999', '123456'].includes(verificationCode)) {
        onSuccess({
          name: 'Shri R. Baruah, IAS',
          role: role,
          station: 'District Disaster Management Authority, Kamrup Metro'
        });
      } else {
        setError('Verification failed: Invalid dispatch security token.');
        setIsVerifying(false);
      }
    }, 300);
  };

  const handleDemoBypass = () => {
    setIdentifier('demo@eodoss.gov.in');
    setPassword('eodoss2026');
    setVerificationCode('742918');
    onSuccess({
      name: 'Shri R. Baruah, IAS',
      role: 'LOCAL_AUTHORITY',
      station: 'District Disaster Management Authority, Kamrup Metro'
    });
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#F4F1EA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#FFFEFA',
        border: '1px solid #DCD7CC',
        borderRadius: 8,
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        padding: '32px 36px'
      }}>
        {/* Emblem & Official Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            backgroundColor: '#2458A6',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <Shield size={24} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 20,
            fontWeight: 700,
            color: '#1D252A',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0'
          }}>
            EODOSS
          </h1>

          <div style={{
            fontSize: 13,
            color: '#5A656E',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600
          }}>
            Emergency Operations & Disaster Orchestration Support System
          </div>

          <div style={{
            fontSize: 12,
            color: '#83909C',
            marginTop: 4
          }}>
            Authorized Regional Disaster Response Command
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FBECEB',
            border: '1px solid rgba(184, 61, 56, 0.3)',
            color: '#992B26',
            borderRadius: 6,
            padding: '10px 12px',
            fontSize: 12.5,
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertTriangle size={15} color="#B83D38" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#1D252A',
                fontFamily: 'var(--font-heading)',
                marginBottom: 6
              }}>
                Authority Identifier
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFEFA',
                  border: '1px solid #DCD7CC',
                  borderRadius: 6,
                  color: '#1D252A',
                  padding: '10px 12px',
                  fontSize: 13.5,
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#1D252A',
                fontFamily: 'var(--font-heading)',
                marginBottom: 6
              }}>
                Security Passphrase
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFEFA',
                  border: '1px solid #DCD7CC',
                  borderRadius: 6,
                  color: '#1D252A',
                  padding: '10px 12px',
                  fontSize: 13.5,
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '11px 16px',
                backgroundColor: '#2458A6',
                color: '#FFFFFF',
                borderRadius: 6,
                border: 'none',
                fontSize: 13.5,
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
              className="civic-button-primary"
            >
              <span>Continue to Verification</span>
              <ArrowRight size={15} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#1D252A',
                fontFamily: 'var(--font-heading)',
                marginBottom: 6
              }}>
                Authority Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFEFA',
                  border: '1px solid #DCD7CC',
                  borderRadius: 6,
                  color: '#1D252A',
                  padding: '9px 12px',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                <option value="LOCAL_AUTHORITY">Local Incident Commander (Kamrup Metro)</option>
                <option value="DISTRICT_AUTHORITY">District Disaster Commissioner (DDMA)</option>
                <option value="E_RESQ_OPERATOR">E-RESQ Operations Chief</option>
                <option value="E_SUPP_OPERATOR">E-SUPP Logistics Coordinator</option>
                <option value="VIEWER_AUDITOR">State Disaster Auditor</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#1D252A',
                fontFamily: 'var(--font-heading)',
                marginBottom: 6
              }}>
                6-Digit Dispatch Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="742918"
                style={{
                  width: '100%',
                  backgroundColor: '#F4F1EA',
                  border: '1px solid #DCD7CC',
                  borderRadius: 6,
                  color: '#1D252A',
                  letterSpacing: '0.3em',
                  textAlign: 'center',
                  padding: '10px 12px',
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none'
                }}
                required
              />
              <div style={{ fontSize: 11, color: '#5A656E', marginTop: 6, textAlign: 'center' }}>
                Evaluator bypass code: <span style={{ fontWeight: 600, color: '#2458A6' }}>742918</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: '#FFFEFA',
                  border: '1px solid #DCD7CC',
                  borderRadius: 6,
                  color: '#5A656E',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                className="civic-button-secondary"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isVerifying}
                style={{
                  flex: 2,
                  padding: '10px 16px',
                  backgroundColor: '#2458A6',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                className="civic-button-primary"
              >
                <KeyRound size={15} />
                <span>{isVerifying ? 'Verifying...' : 'Authorize & Enter'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Demo One-Click Bypass */}
        <div style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: '1px solid #DCD7CC',
          textAlign: 'center'
        }}>
          <button
            type="button"
            onClick={handleDemoBypass}
            style={{
              width: '100%',
              backgroundColor: '#FDF6E9',
              border: '1px solid rgba(201, 136, 38, 0.4)',
              color: '#9A6514',
              padding: '9px 14px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <CheckCircle2 size={15} color="#C98826" />
            <span>Judge & Evaluator One-Click Bypass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
