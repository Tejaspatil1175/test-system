import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Key,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

export default function ManageTeams() {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
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

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let autoPass = '';
    for (let i = 0; i < 8; i++) {
      autoPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(autoPass);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await api.post('/admin/create-team', {
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

  const handleCopyCredentials = (team) => {
    const credText = `Team: ${team.teamName}\nUsername: ${team.username}`;
    navigator.clipboard.writeText(credText);
    setCopiedId(team._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMs = (ms) => {
    if (!ms) return '-';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) return teams;
    const term = searchTerm.toLowerCase();
    return teams.filter(
      (t) =>
        (t.teamName && t.teamName.toLowerCase().includes(term)) ||
        (t.username && t.username.toLowerCase().includes(term))
    );
  }, [teams, searchTerm]);

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
              Candidate Accounts
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Manage Teams
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Register new participating teams, issue access credentials, and monitor live test progress
          </p>
        </div>

        <button onClick={fetchTeams} className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} disabled={fetching}>
          <RefreshCw size={15} className={fetching ? 'spin' : ''} /> Refresh Roster
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Register New Candidate Team
          </h2>
        </div>

        <form onSubmit={handleCreateTeam}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div className="form-group" style={{ marginBottom: '0.25rem' }}>
              <label className="form-label">Team / Candidate Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Binary Beasts"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.25rem' }}>
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

            <div className="form-group" style={{ marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Key size={12} /> Auto Generate
                </button>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. pass123 or generate"
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
            {loading ? 'Creating Team Account...' : 'Create Team Account'}
          </button>
        </form>
      </div>

      {/* Registered Teams Table Card */}
      <div className="glass-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Registered Teams ({teams.length})
            </h2>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
              placeholder="Search teams by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={22} className="spin" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            Loading team roster...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            {teams.length === 0
              ? 'No teams registered yet. Use the form above to add candidate teams.'
              : `No teams matching "${searchTerm}".`}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Username</th>
                  <th>Session Status</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{t.teamName}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>@{t.username}</td>
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
                        <span
                          className="badge"
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Not Started
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: t.score !== null ? '#10b981' : 'var(--text-muted)' }}>
                        {t.score !== null ? `${t.score} pts` : '-'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatMs(t.timeTakenMs)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleCopyCredentials(t)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        title="Copy login details"
                      >
                        {copiedId === t._id ? (
                          <>
                            <Check size={13} color="#10b981" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Copy Details
                          </>
                        )}
                      </button>
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
