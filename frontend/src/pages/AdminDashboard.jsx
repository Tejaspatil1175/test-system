import React, { useState, useEffect } from 'react';
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
  ShieldAlert
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    teamsCount: 0,
    questionsCount: 0,
    submissionsCount: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchOverview = async () => {
      try {
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

    fetchOverview();
  }, []);

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
  ];

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
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
    </div>
  );
}
