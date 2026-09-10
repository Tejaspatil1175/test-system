import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  Award,
  Calculator,
  Download,
  RefreshCw,
  Trophy,
  Clock,
  Search,
  Sparkles,
  Users,
  Target,
  Zap,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function ViewResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
        text: 'Leaderboard updated! All scores and ranks calculated successfully.',
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
      alert('Failed to download PDF scorecard. Make sure this team has submitted.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatMs = (ms) => {
    if (!ms) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  // Filtered leaderboard
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results;
    const term = searchTerm.toLowerCase();
    return results.filter(
      (r) =>
        (r.teamName && r.teamName.toLowerCase().includes(term)) ||
        (r.username && r.username.toLowerCase().includes(term))
    );
  }, [results, searchTerm]);

  // Summary Metrics
  const stats = useMemo(() => {
    if (!results || results.length === 0) {
      return { total: 0, highest: 0, avg: 0, fastestMs: 0 };
    }
    const scores = results.map((r) => r.score || 0);
    const total = results.length;
    const highest = Math.max(...scores);
    const avg = (scores.reduce((a, b) => a + b, 0) / total).toFixed(1);
    const times = results.map((r) => r.timeTakenMs || 0).filter((t) => t > 0);
    const fastestMs = times.length > 0 ? Math.min(...times) : 0;
    return { total, highest, avg, fastestMs };
  }, [results]);

  const topThree = useMemo(() => {
    return results.slice(0, 3);
  }, [results]);

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
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Trophy size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', lineHeight: 1.2 }}>
              Results & Rankings
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
              Automated score computation, live leaderboard, and official PDF scorecard generation
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchResults}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.1rem' }}
            disabled={fetching}
          >
            <RefreshCw size={16} className={fetching ? 'spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleCalculateResults}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
            disabled={loading}
          >
            <Calculator size={17} /> {loading ? 'Calculating Ranks...' : 'Calculate Results'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Evaluated Teams
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} color="#6366f1" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {stats.total}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Participating candidate teams</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Top Score
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trophy size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f59e0b' }}>
            {stats.highest} <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>pts</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Highest test mark recorded</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Average Score
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Target size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {stats.avg} <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>pts</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all submissions</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Fastest Submission
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={18} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {stats.fastestMs ? formatMs(stats.fastestMs) : '-'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speed tie-breaker record</span>
        </div>
      </div>

      {/* Top 3 Podium Cards (Show when results exist) */}
      {topThree.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            🏆 Top Performers
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {topThree.map((item, idx) => {
              const rankThemes = [
                {
                  title: '1st Place Champion',
                  border: '#f59e0b',
                  gradient: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
                  badgeBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  iconColor: '#f59e0b',
                  tag: 'Gold Medal',
                },
                {
                  title: '2nd Place Runner-Up',
                  border: '#94a3b8',
                  gradient: 'linear-gradient(135deg, #f1f5f9 0%, #ffffff 100%)',
                  badgeBg: 'linear-gradient(135deg, #94a3b8, #64748b)',
                  iconColor: '#64748b',
                  tag: 'Silver Medal',
                },
                {
                  title: '3rd Place Second Runner-Up',
                  border: '#b45309',
                  gradient: 'linear-gradient(135deg, #ffedd5 0%, #ffffff 100%)',
                  badgeBg: 'linear-gradient(135deg, #b45309, #78350f)',
                  iconColor: '#b45309',
                  tag: 'Bronze Medal',
                },
              ];
              const theme = rankThemes[idx] || rankThemes[0];

              return (
                <div
                  key={item.teamId || idx}
                  className="glass-card"
                  style={{
                    background: theme.gradient,
                    border: `1.5px solid ${theme.border}`,
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '9999px',
                        background: theme.badgeBg,
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trophy size={13} /> Rank #{item.rank || idx + 1}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: theme.iconColor }}>
                      {theme.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {item.teamName}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    @{item.username}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.85)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981' }}>
                        {item.score} pts
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Time Taken</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {formatMs(item.timeTakenMs)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadPdf(item.teamId, item.teamName)}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '0.55rem' }}
                    disabled={downloadingId === item.teamId}
                  >
                    <Download size={14} /> {downloadingId === item.teamId ? 'Downloading...' : 'Download Scorecard PDF'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Leaderboard Table Card */}
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
            <Award size={22} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1.2 }}>
                Full Leaderboard Table
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Sorted by highest marks and fastest completion
              </span>
            </div>
          </div>

          {/* Table Search Filter */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem', paddingRight: '1rem', fontSize: '0.85rem' }}
              placeholder="Search by team or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
            Loading evaluated test results...
          </div>
        ) : filteredResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            {results.length === 0 ? (
              <>
                <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  No Test Results Evaluated Yet
                </h3>
                <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
                  Once candidate teams have submitted their tests, click the <strong>"Calculate Results"</strong> button above to compute scores and generate ranks.
                </p>
                <button
                  onClick={handleCalculateResults}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  disabled={loading}
                >
                  <Calculator size={16} /> Compute Scores & Ranks
                </button>
              </>
            ) : (
              <p>No teams matched the search filter "{searchTerm}".</p>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Rank</th>
                  <th>Candidate Team</th>
                  <th>Username</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                  <th>Submitted Time</th>
                  <th style={{ textAlign: 'right' }}>Official Certificate</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r) => {
                  const isGold = r.rank === 1;
                  const isSilver = r.rank === 2;
                  const isBronze = r.rank === 3;

                  return (
                    <tr
                      key={r.submissionId || r.teamId}
                      style={{
                        background: isGold
                          ? 'rgba(245, 158, 11, 0.04)'
                          : isSilver
                          ? 'rgba(148, 163, 184, 0.04)'
                          : isBronze
                          ? 'rgba(180, 83, 9, 0.04)'
                          : 'transparent',
                      }}
                    >
                      <td>
                        {isGold && (
                          <span
                            className="badge"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' }}
                          >
                            <Trophy size={11} style={{ marginRight: '3px' }} /> 1st
                          </span>
                        )}
                        {isSilver && (
                          <span
                            className="badge"
                            style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#ffffff' }}
                          >
                            2nd
                          </span>
                        )}
                        {isBronze && (
                          <span
                            className="badge"
                            style={{ background: 'linear-gradient(135deg, #b45309, #78350f)', color: '#ffffff' }}
                          >
                            3rd
                          </span>
                        )}
                        {!isGold && !isSilver && !isBronze && (
                          <span style={{ fontWeight: '700', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>
                            #{r.rank}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                          {r.teamName}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        @{r.username}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: '800',
                            color: '#10b981',
                          }}
                        >
                          {r.score}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>pts</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={14} color="var(--text-muted)" />
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {formatMs(r.timeTakenMs)}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {r.endTime ? new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDownloadPdf(r.teamId, r.teamName)}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.4rem 0.85rem',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            gap: '0.4rem',
                          }}
                          disabled={downloadingId === r.teamId}
                          title="Download official PDF report"
                        >
                          <Download size={14} />
                          {downloadingId === r.teamId ? 'Downloading...' : 'PDF Scorecard'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
