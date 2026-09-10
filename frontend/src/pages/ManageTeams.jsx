import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, UserPlus, ArrowLeft, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export default function ManageTeams() {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchTeams = async () => {
    try {
      setFetching(true);
      const res = await api.get('/admin/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await api.post('/admin/create-team', {
        teamName,
        username,
        password,
      });

      setMessage({ type: 'success', text: `Team '${teamName}' created successfully!` });
      setTeamName('');
      setUsername('');
      setPassword('');
      fetchTeams();
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          (err.response && err.response.data && err.response.data.message) ||
          'Failed to create team.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMs = (ms) => {
    if (!ms) return '-';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/admin/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

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
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Manage Teams</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Register new participating teams and track their progress
          </p>
        </div>
        <button onClick={fetchTeams} className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
          <RefreshCw size={14} className={fetching ? 'spin' : ''} /> Refresh List
        </button>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {/* Create Team Form Card */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <UserPlus size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Create New Team</h2>
        </div>

        <form onSubmit={handleCreateTeam}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Team Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Binary Beasts"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Login Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. team_binary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Team Password</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. pass123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '1.25rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Team...' : 'Create Team Account'}
          </button>
        </form>
      </div>

      {/* Registered Teams List Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Users size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Registered Teams ({teams.length})</h2>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Loading teams...
          </div>
        ) : teams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No teams created yet. Use the form above to register your first team.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: '600' }}>{t.teamName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.username}</td>
                    <td>
                      {t.submitted ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Submitted
                        </span>
                      ) : t.startTime ? (
                        <span className="badge badge-warning">
                          <Clock size={12} style={{ marginRight: '4px' }} /> In Progress
                        </span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          Not Started
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {t.score !== null ? t.score : '-'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatMs(t.timeTakenMs)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
