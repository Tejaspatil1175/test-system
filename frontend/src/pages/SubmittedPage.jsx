import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Award, LogOut, ShieldAlert } from 'lucide-react';

export default function SubmittedPage() {
  const navigate = useNavigate();
  const teamName = localStorage.getItem('teamName') || 'Candidate Team';

  useEffect(() => {
    // Clear test-specific cached state on arrival
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
    <div style={{ maxWidth: '580px', margin: '4rem auto 0', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '3.5rem 2rem' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.75rem',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
          }}
        >
          <CheckCircle2 size={44} color="#ffffff" />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem' }}>
          Test Submitted Successfully!
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          Thank you, <strong style={{ color: 'var(--text-primary)' }}>{teamName}</strong>. Your responses and total time taken have been recorded securely. The evaluation team will publish the final rankings soon.
        </p>

        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          <ShieldAlert size={18} color="#059669" />
          <span>Your submission is sealed and cannot be modified.</span>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
        >
          <LogOut size={16} /> Exit & Logout Session
        </button>
      </div>
    </div>
  );
}
