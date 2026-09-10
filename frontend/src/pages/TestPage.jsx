import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, AlertTriangle, CheckCircle2, Send, Save, Award } from 'lucide-react';

export default function TestPage() {
  const [startTime, setStartTime] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [remainingMs, setRemainingMs] = useState(3600000); // 1 hour default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const initializeTest = async () => {
      try {
        setLoading(true);
        // Step 25.1: Call /test/start
        const startRes = await api.get('/test/start');
        if (startRes.data.submitted) {
          navigate('/submitted', { replace: true });
          return;
        }

        const serverStartTime = new Date(startRes.data.startTime).getTime();
        setStartTime(serverStartTime);

        // Step 25.2: Load all questions
        const questionsRes = await api.get('/test/questions');
        setQuestions(questionsRes.data);

        // Compute initial remaining time (1 hour = 3600000ms)
        const elapsed = Date.now() - serverStartTime;
        const initialRemaining = Math.max(0, 3600000 - elapsed);
        setRemainingMs(initialRemaining);

        if (initialRemaining <= 0) {
          navigate('/submitted', { replace: true });
        }
      } catch (err) {
        if (err.response && err.response.status === 403) {
          navigate('/submitted', { replace: true });
          return;
        }
        setError('Failed to initialize test session. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    initializeTest();
  }, [navigate]);

  // Server-synced countdown timer
  useEffect(() => {
    if (!startTime) return;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentRemaining = Math.max(0, 3600000 - elapsed);
      setRemainingMs(currentRemaining);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime]);

  const formatTimer = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLowTime = remainingMs < 300000; // less than 5 minutes

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="glass-card">
          <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>
            Initializing your secure test session...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Timer Bar */}
      <div
        className="glass-card"
        style={{
          position: 'sticky',
          top: '1rem',
          zIndex: 100,
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          border: isLowTime ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Candidate Team</span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
            {localStorage.getItem('teamName') || 'Candidate Session'}
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: isLowTime ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            border: `1px solid ${isLowTime ? '#ef4444' : 'var(--accent-primary)'}`,
            color: isLowTime ? '#f87171' : '#818cf8',
            fontWeight: '700',
            fontSize: '1.25rem',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <Clock size={20} />
          <span>{formatTimer(remainingMs)}</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
          Questions Loaded ({questions.length})
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Test initialized. Timer synchronized with server start time.
        </p>
      </div>
    </div>
  );
}
