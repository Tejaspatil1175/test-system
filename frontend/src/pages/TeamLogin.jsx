import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export default function TeamLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/team/login', { username, password });
      const { token, teamName } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', 'team');
      localStorage.setItem('teamName', teamName || username);

      navigate('/test');
    } catch (err) {
      setError(
        (err.response && err.response.data && err.response.data.message) ||
          'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '4rem auto 0' }}>
      <div className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Users size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Candidate Team Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Enter your assigned credentials to begin the test
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Team Username</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. team_alpha"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.8rem',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Enter Test Session'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/admin/login" style={{ color: 'var(--text-secondary)' }}>
            Are you an administrator? <span style={{ color: 'var(--accent-primary)' }}>Admin Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
