import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, FileQuestion, Award, LogOut, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin/login');
  };

  const dashboardModules = [
    {
      title: 'Manage Teams',
      desc: 'Create new teams, generate credentials, and view test status.',
      icon: <Users size={28} color="#6366f1" />,
      link: '/admin/teams',
      btnText: 'Open Teams',
      badge: 'Teams & Accounts',
    },
    {
      title: 'Manage Questions',
      desc: 'Add, view, and delete test questions with options and correct answers.',
      icon: <FileQuestion size={28} color="#a855f7" />,
      link: '/admin/questions',
      btnText: 'Manage Questions',
      badge: 'Question Bank',
    },
    {
      title: 'View Results & Leaderboard',
      desc: 'Calculate final scores, compute rankings, and download PDF scorecards.',
      icon: <Award size={28} color="#10b981" />,
      link: '/admin/results',
      btnText: 'View Leaderboard',
      badge: 'Evaluation',
    },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Header Banner */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            }}
          >
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', lineHeight: 1.2 }}>
              Admin Control Center
            </h1>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Manage tests, candidate teams, questions, and view live results
            </span>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {item.title}
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  marginBottom: '1.5rem',
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
