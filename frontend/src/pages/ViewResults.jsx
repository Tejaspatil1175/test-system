import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Award, Calculator, Download, ArrowLeft, RefreshCw, Trophy, Clock } from 'lucide-react';

export default function ViewResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchResults = async () => {
    try {
      setFetching(true);
      const res = await api.get('/admin/results');
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleCalculateResults = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await api.post('/admin/calculate-results');
      setResults(res.data);
      setMessage({
        type: 'success',
        text: 'Results evaluated and ranks calculated successfully!',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          (err.response && err.response.data && err.response.data.message) ||
          'Failed to calculate results.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (teamId, teamName) => {
    try {
      setDownloadingId(teamId);
      const response = await api.get(`/admin/pdf/${teamId}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${teamName.replace(/\s+/g, '_')}_result.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF report. Ensure the team has submitted.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatMs = (ms) => {
    if (!ms) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span
          className="badge"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' }}
        >
          <Trophy size={12} style={{ marginRight: '4px' }} /> 1st Place
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span
          className="badge"
          style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#ffffff' }}
        >
          2nd Place
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span
          className="badge"
          style={{ background: 'linear-gradient(135deg, #b45309, #78350f)', color: '#ffffff' }}
        >
          3rd Place
        </span>
      );
    }
    return <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>#{rank}</span>;
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Results & Rankings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Auto-rankings sorted by score (DESC) and time taken (ASC)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={fetchResults} className="btn btn-secondary" style={{ padding: '0.6rem 0.9rem' }}>
            <RefreshCw size={15} className={fetching ? 'spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleCalculateResults}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.1rem' }}
            disabled={loading}
          >
            <Calculator size={16} /> {loading ? 'Calculating...' : 'Calculate Results'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {/* Results Table Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <Award size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Live Leaderboard ({results.length})</h2>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading results...
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No submissions evaluated yet. Click "Calculate Results" once teams submit their test.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team Name</th>
                  <th>Username</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                  <th>Submitted At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.submissionId || r.teamId}>
                    <td>{getRankBadge(r.rank)}</td>
                    <td style={{ fontWeight: '700', fontSize: '1rem' }}>{r.teamName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.username}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: '800',
                          color: '#10b981',
                        }}
                      >
                        {r.score}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} color="var(--text-muted)" />
                        <span>{formatMs(r.timeTakenMs)}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {r.endTime ? new Date(r.endTime).toLocaleTimeString() : '-'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDownloadPdf(r.teamId, r.teamName)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        disabled={downloadingId === r.teamId}
                        title="Download official PDF report"
                      >
                        <Download size={14} /> {downloadingId === r.teamId ? 'Downloading...' : 'PDF'}
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
