import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Clock,
  CheckCircle2,
  Send,
  Save,
  AlertCircle,
  HelpCircle,
  Code2,
  ListOrdered,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Shield,
  Layers,
  RotateCcw,
  Menu,
  X
} from 'lucide-react';

export default function TestPage() {
  const [startTime, setStartTime] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    try {
      const cached = localStorage.getItem('test_answers_cache');
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  });
  const [remainingMs, setRemainingMs] = useState(3600000);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  const navigate = useNavigate();
  const timerRef = useRef(null);
  const autosaveRef = useRef(null);
  const answersRef = useRef(answers);
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleSubmitTest = useCallback(
    async (isAuto = false) => {
      if (submittedRef.current || submitting) return;
      submittedRef.current = true;
      setSubmitting(true);

      if (timerRef.current) clearInterval(timerRef.current);
      if (autosaveRef.current) clearInterval(autosaveRef.current);

      try {
        const currentAnswers = answersRef.current;
        const formatted = Object.keys(currentAnswers).map((qId) => ({
          questionId: qId,
          selectedOption: currentAnswers[qId],
        }));

        await api.post('/test/submit', { answers: formatted });

        try {
          localStorage.removeItem('test_answers_cache');
        } catch (e) {}

        navigate('/submitted', { replace: true });
      } catch (err) {
        if (err.response && err.response.status === 403) {
          navigate('/submitted', { replace: true });
          return;
        }
        setError(
          (err.response && err.response.data && err.response.data.message) ||
            'Failed to submit test. Please retry.'
        );
        submittedRef.current = false;
        setSubmitting(false);
      }
    },
    [navigate, submitting]
  );

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
          handleSubmitTest(true);
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
  }, [navigate, handleSubmitTest]);

  // Periodic autosave every 30s
  useEffect(() => {
    autosaveRef.current = setInterval(async () => {
      if (submittedRef.current) return;
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

  // Countdown timer with auto-submit on timeout
  useEffect(() => {
    if (!startTime) return;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentRemaining = Math.max(0, 3600000 - elapsed);
      setRemainingMs(currentRemaining);

      if (currentRemaining <= 0) {
        clearInterval(timerRef.current);
        handleSubmitTest(true);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, handleSubmitTest]);

  const handleSelectOption = (questionId, option) => {
    if (submitting) return;
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: option };
      try {
        localStorage.setItem('test_answers_cache', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleClearOption = (questionId) => {
    if (submitting) return;
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="center-container">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Loading Test Session...
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Preparing your environment and questions.
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="center-container">
        <div className="glass-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '3rem 2rem' }}>
          <HelpCircle size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem' }}>No Questions Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            The admin has not published any questions for this test yet. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const progressPercent = Math.round((answeredCount / questions.length) * 100);
  const isLowTime = remainingMs < 300000; // < 5 minutes
  const teamName = localStorage.getItem('teamName') || 'Candidate';

  const currentQuestion = questions[currentIndex] || questions[0];
  const isCurrentAnswered = currentQuestion && !!answers[currentQuestion._id];
  const isRearrange = currentQuestion && currentQuestion.type === 'code_rearrange';
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="test-session-container">
      {/* Mobile Backdrop Overlay */}
      {mobilePaletteOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobilePaletteOpen(false)}
        />
      )}

      {/* =========================================================================
          LEFT QUESTION PALETTE SIDEBAR
         ========================================================================= */}
      <aside className={`test-palette-sidebar ${mobilePaletteOpen ? 'open' : ''}`}>
        {/* Palette Header */}
        <div className="test-palette-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                }}
              >
                C
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  CodeCore Test
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {teamName}
                </div>
              </div>
            </div>

            <button
              className="btn btn-ghost admin-mobile-close"
              onClick={() => setMobilePaletteOpen(false)}
              style={{ padding: '4px', border: 'none' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Palette Content: Stats & Q1..Qn Grid */}
        <div className="test-palette-content">
          {/* Status summary boxes */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              Overview
            </div>
            <div className="test-palette-stats">
              {/* Green Card for Answered */}
              <div className="test-stat-card answered">
                <span className="test-stat-count">{answeredCount}</span>
                <span className="test-stat-label">🟢 Answered</span>
              </div>

              {/* Yellow Card for Unanswered */}
              <div className="test-stat-card unanswered">
                <span className="test-stat-count">{unansweredCount}</span>
                <span className="test-stat-label">🟡 Pending</span>
              </div>
            </div>
          </div>

          {/* Question Navigator Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Question Palette
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {questions.length} total
              </span>
            </div>

            <div className="test-palette-grid">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q._id];
                const isCurrent = idx === currentIndex;

                let stateClass = isAnswered ? 'answered' : 'unanswered';
                if (isCurrent) stateClass += ' active-current';

                return (
                  <button
                    key={q._id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobilePaletteOpen(false);
                    }}
                    className={`test-palette-btn ${stateClass}`}
                    title={`Question ${idx + 1}: ${isAnswered ? 'Answered (Green)' : 'Pending (Yellow)'}`}
                  >
                    <span>Q{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend helper */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981', border: '1px solid #059669', display: 'inline-block' }}></span>
              <span><strong>Green:</strong> Answered / Done</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fef3c7', border: '1px solid #fde68a', display: 'inline-block' }}></span>
              <span><strong>Yellow:</strong> Not Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ffffff', border: '2px solid #6366f1', display: 'inline-block' }}></span>
              <span><strong>Ring:</strong> Current Question</span>
            </div>
          </div>
        </div>

        {/* Palette Bottom Footer */}
        <div className="test-palette-footer">
          {lastSaved && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} color="#10b981" />
              <span>{autosaving ? 'Autosaving...' : 'Progress synced'}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setConfirmSubmitModal(true)}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.7rem',
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
            disabled={submitting}
          >
            <Send size={15} /> {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN TEST CONTENT AREA (Single Question at a Time)
         ========================================================================= */}
      <main className="test-stream-wrapper">
        {/* Sticky Top Progress & Timer Bar */}
        <div
          className="glass-card"
          style={{
            position: 'sticky',
            top: '1rem',
            zIndex: 80,
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            border: isLowTime ? '1.5px solid #ef4444' : '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Mobile Open Sidebar Button (hidden on desktop) */}
            <button
              type="button"
              className="btn btn-secondary test-menu-toggle"
              onClick={() => setMobilePaletteOpen(true)}
              style={{ padding: '0.5rem 0.75rem' }}
            >
              <Menu size={18} />
              <span style={{ fontSize: '0.8rem' }}>Q Palette</span>
            </button>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {answeredCount} of {questions.length} answered ({progressPercent}%)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Timer Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: isLowTime ? '#fef2f2' : '#ede9fe',
                border: `1.5px solid ${isLowTime ? '#fca5a5' : '#c7d2fe'}`,
                color: isLowTime ? '#dc2626' : '#4f46e5',
                fontWeight: '800',
                fontSize: '1.25rem',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <Clock size={20} />
              <span>{formatTimer(remainingMs)}</span>
            </div>

            <button
              onClick={() => setConfirmSubmitModal(true)}
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
              disabled={submitting}
            >
              <Send size={15} /> Submit Test
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: '6px',
            background: 'var(--border-color)',
            borderRadius: '999px',
            marginBottom: '1.75rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #6366f1, #10b981)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {/* =====================================================================
            ACTIVE SINGLE QUESTION CARD
           ===================================================================== */}
        {currentQuestion && (
          <div
            key={currentQuestion._id}
            className="glass-card"
            style={{
              border: isCurrentAnswered ? '1.5px solid #10b981' : '1px solid var(--border-color)',
              position: 'relative',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(30, 20, 10, 0.04)',
              minHeight: '420px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Header of Question */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                {/* Status Indicator Pill */}
                <span
                  style={{
                    background: isCurrentAnswered ? '#10b981' : '#fef3c7',
                    color: isCurrentAnswered ? '#ffffff' : '#92400e',
                    border: `1.5px solid ${isCurrentAnswered ? '#059669' : '#fde68a'}`,
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '800',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  Q{currentIndex + 1}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    {isRearrange ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: '#ede9fe',
                          color: '#4f46e5',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ListOrdered size={12} /> Code Rearrangement
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                        }}
                      >
                        C Question
                      </span>
                    )}

                    {isCurrentAnswered ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                        <CheckCircle2 size={13} /> Answered
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                        🟡 Pending Response
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                    {currentQuestion.questionText}
                  </h3>
                </div>
              </div>

              {/* Code Snippet Box (if present) */}
              {currentQuestion.codeSnippet && (
                <div
                  style={{
                    margin: '1rem 0 1.5rem',
                    padding: '1.25rem',
                    background: '#0f172a',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #334155',
                    overflowX: 'auto',
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '0.92rem',
                      color: '#e2e8f0',
                      lineHeight: 1.6,
                    }}
                  >
                    {currentQuestion.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Options List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '1.5rem 0' }}>
                {currentQuestion.options &&
                  currentQuestion.options.map((opt, optIdx) => {
                    const isSelected = answers[currentQuestion._id] === opt;
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQuestion._id, opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem 1.25rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-primary)',
                          border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name={`question_${currentQuestion._id}`}
                          checked={isSelected}
                          onChange={() => handleSelectOption(currentQuestion._id, opt)}
                          disabled={submitting}
                          style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)', transform: 'scale(1.15)' }}
                        />
                        <span
                          style={{
                            fontWeight: '800',
                            fontSize: '0.95rem',
                            color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                            width: '26px',
                          }}
                        >
                          ({String.fromCharCode(65 + optIdx)})
                        </span>
                        <span
                          style={{
                            fontSize: '1rem',
                            color: 'var(--text-primary)',
                            fontWeight: isSelected ? '700' : '400',
                            fontFamily: isRearrange ? 'monospace' : 'inherit',
                          }}
                        >
                          {opt}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* =================================================================
                NAVIGATION CONTROLS: PREVIOUS | CLEAR | NEXT / SUBMIT
               ================================================================= */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1.5rem',
                marginTop: '1.5rem',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              {/* Left Group: Previous Button */}
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={isFirst || submitting}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.65rem 1.25rem',
                  opacity: isFirst ? 0.45 : 1,
                  cursor: isFirst ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={18} /> Previous Question
              </button>

              {/* Center Group: Clear Selection */}
              {isCurrentAnswered && (
                <button
                  type="button"
                  onClick={() => handleClearOption(currentQuestion._id)}
                  disabled={submitting}
                  className="btn btn-ghost"
                  style={{
                    fontSize: '0.85rem',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <RotateCcw size={14} /> Clear Choice
                </button>
              )}

              {/* Right Group: Next / Finish Button */}
              {isLast ? (
                <button
                  type="button"
                  onClick={() => setConfirmSubmitModal(true)}
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.65rem 1.4rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  }}
                >
                  Review & Submit <Send size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.65rem 1.4rem',
                  }}
                >
                  Next Question <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Submit Modal */}
      {confirmSubmitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
        >
          <div className="glass-card" style={{ maxWidth: '460px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Confirm Test Submission
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to finalize and submit your test now?
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#065f46', display: 'block' }}>{answeredCount}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669' }}>Answered</span>
              </div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#92400e', display: 'block' }}>{unansweredCount}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b45309' }}>Unanswered</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmSubmitModal(false)}
              >
                Back to Test
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                onClick={() => {
                  setConfirmSubmitModal(false);
                  handleSubmitTest(false);
                }}
                disabled={submitting}
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
