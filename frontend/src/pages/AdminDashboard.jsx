import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Users,
  FileQuestion,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ShieldAlert,
  Settings,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Radio
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    teamsCount: 0,
    questionsCount: 0,
    submissionsCount: 0,
    loading: true,
  });

  const [testConfig, setTestConfig] = useState({
    isTestActive: false,
    testStartTime: null,
    durationMinutes: 60,
    testEnded: false,
    loading: true,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // 'start' | 'stop' | 'reset'
  const [statusMsg, setStatusMsg] = useState('');

  const fetchTestStatus = async () => {
    try {
      const res = await api.get('/admin/test-status');
      setTestConfig({ ...res.data, loading: false });
    } catch (e) {
      console.warn('Failed to fetch test status:', e);
    }
  };

  const fetchOverview = async () => {
    try {
      const [teamsRes, questionsRes, resultsRes, statusRes] = await Promise.allSettled([
        api.get('/admin/teams'),
        api.get('/admin/questions'),
        api.get('/admin/results'),
        api.get('/admin/test-status'),
      ]);

      setStats({
        teamsCount: teamsRes.status === 'fulfilled' ? teamsRes.value.data.length : 0,
        questionsCount: questionsRes.status === 'fulfilled' ? questionsRes.value.data.length : 0,
        submissionsCount: resultsRes.status === 'fulfilled' ? resultsRes.value.data.length : 0,
        loading: false,
      });

      if (statusRes.status === 'fulfilled') {
        setTestConfig({ ...statusRes.value.data, loading: false });
      }
    } catch (err) {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchTestStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTest = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/admin/test-status/start');
      setTestConfig({ ...res.data.config, loading: false });
      setStatusMsg('🚀 Test started! All logged-in candidates are entering the exam.');
      setConfirmModal(null);
    } catch (err) {
      setStatusMsg('Failed to start test.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopTest = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/admin/test-status/stop');
      setTestConfig({ ...res.data.config, loading: false });
      setStatusMsg('⏹️ Test concluded globally.');
      setConfirmModal(null);
    } catch (err) {
      setStatusMsg('Failed to stop test.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetTest = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/admin/test-status/reset');
      setTestConfig({ ...res.data.config, loading: false });
      setStatusMsg('🔄 Test reset to Lobby state.');
      setConfirmModal(null);
    } catch (err) {
      setStatusMsg('Failed to reset test.');
    } finally {
      setActionLoading(false);
    }
  };

  const dashboardModules = [
    {
      title: 'Candidate Teams',
      desc: 'Register student teams, generate credentials, and monitor live test access.',
      link: '/admin/teams',
      btnText: 'Manage Teams',
      badge: `${stats.teamsCount} Registered`,
      icon: <Users size={22} color="#6366f1" />,
      accent: '#6366f1',
    },
    {
      title: 'Question Bank',
      desc: 'Create, inspect, and organize MCQ questions, options, and scoring keys.',
      link: '/admin/questions',
      btnText: 'Manage Questions',
      badge: `${stats.questionsCount} Active Questions`,
      icon: <FileQuestion size={22} color="#8b5cf6" />,
      accent: '#8b5cf6',
    },
    {
      title: 'Evaluation & Rankings',
      desc: 'Calculate final grades, rank candidates, and export official PDF scorecards.',
      link: '/admin/results',
      btnText: 'View Leaderboard',
      badge: `${stats.submissionsCount} Evaluated`,
      icon: <Award size={22} color="#10b981" />,
      accent: '#10b981',
    },
    {
      title: 'Database & Settings',
      desc: 'Clear test submissions, reset candidate rosters, or factory reset collections.',
      link: '/admin/settings',
      btnText: 'System Settings',
      badge: 'Maintenance',
      icon: <Settings size={22} color="#f59e0b" />,
      accent: '#f59e0b',
    },
  ];

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Overview
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.2 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Monitor candidate progress, maintain question banks, and evaluate test performance
        </p>
      </div>

      {statusMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800' }}>×</button>
        </div>
      )}

      {/* =========================================================================
          GLOBAL TEST CONTROL CENTER CARD
         ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem 1.75rem',
          marginBottom: '2rem',
          border: testConfig.isTestActive ? '2px solid #10b981' : testConfig.testEnded ? '1.5px solid #f59e0b' : '1.5px solid var(--border-color)',
          background: testConfig.isTestActive ? '#f0fdf4' : '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          {/* Status info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: testConfig.isTestActive ? 'linear-gradient(135deg, #10b981, #059669)' : testConfig.testEnded ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: testConfig.isTestActive ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 12px rgba(99, 102, 241, 0.25)',
              }}
            >
              {testConfig.isTestActive ? <Radio size={24} className="spin" /> : <Play size={24} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Exam Control Center
                </span>
                {testConfig.isTestActive ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span> LIVE TEST IN PROGRESS
                  </span>
                ) : testConfig.testEnded ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '999px' }}>
                    TEST CONCLUDED
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '999px' }}>
                    🔴 WAITING IN LOBBY (NOT STARTED)
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {testConfig.isTestActive
                  ? 'All Candidates are currently taking the exam'
                  : testConfig.testEnded
                  ? 'The test session has concluded'
                  : 'Candidates are waiting in the lobby to start'}
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!testConfig.isTestActive ? (
              <button
                type="button"
                onClick={() => setConfirmModal('start')}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 1.6rem',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Play size={18} fill="#ffffff" /> Start Test for All Candidates
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmModal('stop')}
                disabled={actionLoading}
                className="btn btn-secondary"
                style={{
                  padding: '0.75rem 1.4rem',
                  fontSize: '0.95rem',
                  color: '#dc2626',
                  borderColor: '#fca5a5',
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Square size={16} fill="#dc2626" /> End Test Session
              </button>
            )}

            {(testConfig.isTestActive || testConfig.testEnded) && (
              <button
                type="button"
                onClick={() => setConfirmModal('reset')}
                disabled={actionLoading}
                className="btn btn-secondary"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={15} /> Reset to Lobby
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div
        style={{
          display: 'grid',

          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.25rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Registered Teams
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={17} color="#6366f1" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {stats.loading ? '...' : stats.teamsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Eligible test participants</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Question Bank
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileQuestion size={17} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {stats.loading ? '...' : stats.questionsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MCQ questions loaded</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Completed Tests
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={17} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#10b981' }}>
            {stats.loading ? '...' : stats.submissionsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submissions recorded</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Test Duration
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={17} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            60 <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>min</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard session limit</span>
        </div>
      </div>

      {/* Primary Modules Grid */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Management Modules
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {dashboardModules.map((item, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.75rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {item.icon}
                </div>
                <span className="badge badge-success">{item.badge}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  marginBottom: '1.75rem',
                }}
              >
                {item.desc}
              </p>
            </div>

            <Link
              to={item.link}
              className="btn btn-primary"
              style={{ width: '100%', textDecoration: 'none' }}
            >
              {item.btnText} <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
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
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              {confirmModal === 'start'
                ? 'Start Global Test Session?'
                : confirmModal === 'stop'
                ? 'Conclude Global Test Session?'
                : 'Reset Test to Lobby State?'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {confirmModal === 'start'
                ? 'This will immediately start the exam for ALL logged-in candidate teams simultaneously. Their 60-minute countdown will begin now.'
                : confirmModal === 'stop'
                ? 'This will stop the active exam and prevent further submissions from candidate teams.'
                : 'This will reset the exam state back to the pre-test lobby state so candidates wait until you start again.'}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmModal(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  background:
                    confirmModal === 'start'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : confirmModal === 'stop'
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                }}
                onClick={
                  confirmModal === 'start'
                    ? handleStartTest
                    : confirmModal === 'stop'
                    ? handleStopTest
                    : handleResetTest
                }
                disabled={actionLoading}
              >
                {actionLoading
                  ? 'Processing...'
                  : confirmModal === 'start'
                  ? 'Yes, Start Test Now'
                  : confirmModal === 'stop'
                  ? 'Yes, End Test'
                  : 'Yes, Reset to Lobby'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

