import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Settings,
  Database,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Users,
  FileQuestion,
  Award,
  ShieldCheck,
  RotateCcw,
  Lock
} from 'lucide-react';

export default function AdminSettings() {
  const [stats, setStats] = useState({
    teamsCount: 0,
    questionsCount: 0,
    submissionsCount: 0,
    loading: true,
  });

  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    actionKey: '',
    title: '',
    desc: '',
    confirmWord: '',
  });
  const [inputConfirmation, setInputConfirmation] = useState('');

  const fetchStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));
      const [teamsRes, questionsRes, resultsRes] = await Promise.allSettled([
        api.get('/admin/teams'),
        api.get('/admin/questions'),
        api.get('/admin/results'),
      ]);

      setStats({
        teamsCount: teamsRes.status === 'fulfilled' ? teamsRes.value.data.length : 0,
        questionsCount: questionsRes.status === 'fulfilled' ? questionsRes.value.data.length : 0,
        submissionsCount: resultsRes.status === 'fulfilled' ? resultsRes.value.data.length : 0,
        loading: false,
      });
    } catch (err) {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const openConfirmationModal = (actionKey, title, desc, confirmWord = '') => {
    setMessage({ type: '', text: '' });
    setInputConfirmation('');
    setModalConfig({ actionKey, title, desc, confirmWord });
    setModalOpen(true);
  };

  const handleExecuteReset = async () => {
    const { actionKey, confirmWord } = modalConfig;
    if (confirmWord && inputConfirmation.trim().toUpperCase() !== confirmWord.toUpperCase()) {
      setMessage({ type: 'error', text: `Please type "${confirmWord}" exactly to confirm.` });
      return;
    }

    setModalOpen(false);
    setActionLoading(actionKey);
    setMessage({ type: '', text: '' });

    try {
      let endpoint = '';
      if (actionKey === 'submissions') endpoint = '/admin/reset/submissions';
      else if (actionKey === 'teams') endpoint = '/admin/reset/teams';
      else if (actionKey === 'questions') endpoint = '/admin/reset/questions';
      else if (actionKey === 'all') endpoint = '/admin/reset/all';

      const res = await api.post(endpoint);
      setMessage({
        type: 'success',
        text: res.data.message || 'Database operation completed successfully.',
      });
      fetchStats();
    } catch (err) {
      setMessage({
        type: 'error',
        text: (err.response && err.response.data && err.response.data.message) || 'Failed to execute database operation.',
      });
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
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
              System Controls
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Settings & Database Maintenance
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Manage MongoDB collections, wipe test submissions, or perform full system data resets
          </p>
        </div>

        <button onClick={fetchStats} className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} disabled={stats.loading}>
          <RefreshCw size={15} className={stats.loading ? 'spin' : ''} /> Refresh Status
        </button>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {/* Database Snapshot Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Teams in DB</span>
            <Users size={17} color="#6366f1" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {stats.loading ? '...' : stats.teamsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered candidate teams</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Questions in DB</span>
            <FileQuestion size={17} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {stats.loading ? '...' : stats.questionsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active test questions</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Submissions in DB</span>
            <Award size={17} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981' }}>
            {stats.loading ? '...' : stats.submissionsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed test evaluations</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Admin Protected</span>
            <ShieldCheck size={17} color="#059669" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#059669', marginTop: '6px' }}>
            Safe From Wipes
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin auth remains intact</span>
        </div>
      </div>

      {/* Database Management / Danger Zone Section */}
      <div className="glass-card" style={{ border: '1.5px solid #fecaca', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={18} color="#dc2626" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#991b1b', lineHeight: 1.2 }}>
              Database Clearing & Reset Operations
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Execute granular collection resets or complete test series purges
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action 1: Clear Submissions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ maxWidth: '650px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                1. Clear Test Submissions & Results
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Deletes all student test responses, marks, and timer records. Teams and Question Bank are preserved so candidate teams can retake or start a fresh test round.
              </p>
            </div>
            <button
              onClick={() =>
                openConfirmationModal(
                  'submissions',
                  'Clear All Test Submissions?',
                  'This will permanently delete all evaluated results and answers. Teams will be reset so they can retake the test. Questions will NOT be deleted.',
                  'CLEAR'
                )
              }
              className="btn btn-secondary"
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
              disabled={actionLoading !== ''}
            >
              <RotateCcw size={15} /> {actionLoading === 'submissions' ? 'Clearing...' : 'Clear Submissions'}
            </button>
          </div>

          {/* Action 2: Clear Teams */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ maxWidth: '650px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                2. Delete All Candidate Teams
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Permanently removes all registered team accounts and their test histories. The question bank is retained.
              </p>
            </div>
            <button
              onClick={() =>
                openConfirmationModal(
                  'teams',
                  'Delete All Candidate Teams?',
                  'This will delete all student accounts and their associated test submissions. Questions in the bank will NOT be deleted.',
                  'DELETE'
                )
              }
              className="btn btn-secondary"
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
              disabled={actionLoading !== ''}
            >
              <Trash2 size={15} /> {actionLoading === 'teams' ? 'Deleting...' : 'Delete All Teams'}
            </button>
          </div>

          {/* Action 3: Clear Questions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ maxWidth: '650px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                3. Clear Question Bank
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Deletes all questions from the MCQ bank. Candidate team accounts are preserved.
              </p>
            </div>
            <button
              onClick={() =>
                openConfirmationModal(
                  'questions',
                  'Clear All Questions?',
                  'This will permanently delete all multiple choice questions from the question bank.',
                  'DELETE'
                )
              }
              className="btn btn-secondary"
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
              disabled={actionLoading !== ''}
            >
              <Trash2 size={15} /> {actionLoading === 'questions' ? 'Clearing...' : 'Clear Questions'}
            </button>
          </div>

          {/* Action 4: Full Factory Reset */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ maxWidth: '650px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#991b1b', marginBottom: '0.2rem' }}>
                  4. Factory Reset / Wipe Entire Test Database
                </h3>
                <span className="badge badge-danger">High Impact</span>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                Completely wipes all submissions, all candidate teams, and all questions. <strong>Your Administrator login account is preserved and safe.</strong>
              </p>
            </div>
            <button
              onClick={() =>
                openConfirmationModal(
                  'all',
                  'Factory Reset System Database?',
                  'WARNING: This will purge ALL candidate teams, ALL submissions, and ALL questions. Your admin credentials (tejaspatil1175@gmail.com) will remain safe.',
                  'RESET'
                )
              }
              className="btn btn-danger"
              style={{ padding: '0.65rem 1.25rem' }}
              disabled={actionLoading !== ''}
            >
              <Trash2 size={15} /> {actionLoading === 'all' ? 'Wiping Database...' : 'Factory Reset All'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
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
          <div
            className="glass-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={20} color="#dc2626" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {modalConfig.title}
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {modalConfig.desc}
            </p>

            {modalConfig.confirmWord && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                  Type <strong style={{ color: '#dc2626' }}>{modalConfig.confirmWord}</strong> to confirm:
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Type "${modalConfig.confirmWord}"`}
                  value={inputConfirmation}
                  onChange={(e) => setInputConfirmation(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleExecuteReset}
                disabled={modalConfig.confirmWord && inputConfirmation.trim().toUpperCase() !== modalConfig.confirmWord.toUpperCase()}
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
