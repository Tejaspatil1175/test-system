import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, AlertTriangle, CheckCircle2, Award, ListChecks } from 'lucide-react';

export default function TestPage() {
  const [startTime, setStartTime] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(() => {
    try {
      const cached = localStorage.getItem('test_answers_cache');
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  });
  const [autosaving, setAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autosaveRef = useRef(null);
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Periodic autosave every 30s
  useEffect(() => {
    autosaveRef.current = setInterval(async () => {
      const currentAnswers = answersRef.current;
      const formatted = Object.keys(currentAnswers).map((qId) => ({
        questionId: qId,
        selectedOption: currentAnswers[qId],
      }));

      if (formatted.length > 0) {
        try {
          setAutosaving(true);
          await api.post('/test/autosave', { answers: formatted });
          setLastSaved(new Date());
        } catch (e) {
          console.warn('Silent autosave failed:', e);
        } finally {
          setAutosaving(false);
        }
      }
    }, 30000);

    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current);
    };
  }, []);


  useEffect(() => {
    const initializeTest = async () => {
      try {
        setLoading(true);
        const startRes = await api.get('/test/start');
        if (startRes.data.submitted) {
          navigate('/submitted', { replace: true });
          return;
        }

        const serverStartTime = new Date(startRes.data.startTime).getTime();
        setStartTime(serverStartTime);

        const questionsRes = await api.get('/test/questions');
        setQuestions(questionsRes.data);

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

  // Countdown timer
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

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: option };
      try {
        localStorage.setItem('test_answers_cache', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const formatTimer = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter((qId) => answers[qId]).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isLowTime = remainingMs < 300000;

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
      {/* Sticky Header Bar */}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {lastSaved && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={12} color="#10b981" /> {autosaving ? 'Saving...' : 'Saved'}
            </span>
          )}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Progress</span>
            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
              {answeredCount} of {questions.length} answered
            </div>
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
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          marginBottom: '2rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #6366f1, #10b981)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Question List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {questions.map((q, idx) => {
          const selected = answers[q._id];
          return (
            <div
              key={q._id}
              className="glass-card"
              style={{
                border: selected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    background: selected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', lineHeight: 1.5, marginTop: '2px' }}>
                  {q.questionText}
                </h3>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '2.8rem' }}>
                {q.options &&
                  q.options.map((opt, optIdx) => {
                    const isSelected = selected === opt;
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleSelectOption(q._id, opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          padding: '0.85rem 1.25rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                          border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name={`question_${q._id}`}
                          checked={isSelected}
                          onChange={() => handleSelectOption(q._id, opt)}
                          style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                        />
                        <span style={{ fontWeight: '600', color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                          ({String.fromCharCode(65 + optIdx)})
                        </span>
                        <span style={{ fontSize: '0.95rem', color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                          {opt}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
