import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut, Lock, Check } from 'lucide-react';

export default function SubmittedPage() {
  const navigate = useNavigate();
  const teamName = localStorage.getItem('teamName') || 'Candidate Team';
  const submissionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  useEffect(() => {
    try {
      localStorage.removeItem('test_answers_cache');
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('teamName');
    navigate('/team/login', { replace: true });
  };

  return (
    <div style={{ maxWidth: '520px', margin: '4rem auto 0', textAlign: 'left' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'var(--success-bg)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              color: 'var(--success)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={12} /> Test Complete
          </span>
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Submission Confirmed
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Your test responses have been encrypted and submitted to the evaluation repository.
        </p>

        {/* Submission Details Card */}
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Candidate Team</span>
            <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>{teamName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Submitted At</span>
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>{submissionTime}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Session Integrity</span>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> Sealed & Final
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
        >
          <LogOut size={16} /> Exit & Logout Session
        </button>
      </div>
    </div>
  );
}
