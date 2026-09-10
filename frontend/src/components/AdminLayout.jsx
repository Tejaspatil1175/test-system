import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  Award,
  LogOut,
  Search,
  Bell,
  Shield,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: 'Manage Teams',
      path: '/admin/teams',
      icon: <Users size={20} />,
    },
    {
      label: 'Question Bank',
      path: '/admin/questions',
      icon: <FileQuestion size={20} />,
    },
    {
      label: 'Results & Ranks',
      path: '/admin/results',
      icon: <Award size={20} />,
    },
  ];

  return (
    <div className="admin-wrapper">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}>
                CodeCore
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                Admin
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Assessment Control Suite
            </span>
          </div>
          <button
            className="admin-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-group-title">MAIN NAVIGATION</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Sidebar */}
        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Topbar */}
      <div className="admin-main-wrapper">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

            <div className="admin-search-box">
              <Search size={17} className="admin-search-icon" />
              <input
                type="text"
                placeholder="Search teams, questions, or test series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>

          <div className="admin-topbar-right">
            {/* Live Status Badge */}
            <div className="admin-live-badge">
              <span className="admin-live-dot" />
              <span className="admin-live-text">Live System</span>
            </div>

            {/* Notification Bell */}
            <button className="admin-bell-btn" title="Notifications">
              <Bell size={19} />
              <span className="admin-bell-badge" />
            </button>

            {/* User Profile Pill */}
            <div className="admin-user-profile">
              <div className="admin-avatar">TP</div>
              <div className="admin-user-meta">
                <span className="admin-user-name">Tejas Patil</span>
                <span className="admin-user-role">Verified Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page Outlet */}
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
