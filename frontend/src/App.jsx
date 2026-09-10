import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageTeams from './pages/ManageTeams';
import ManageQuestions from './pages/ManageQuestions';
import ViewResults from './pages/ViewResults';
import AdminSettings from './pages/AdminSettings';
import TeamLogin from './pages/TeamLogin';
import TestPage from './pages/TestPage';
import SubmittedPage from './pages/SubmittedPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Candidate & Public Routes */}
        <Route
          path="/"
          element={
            <div className="app-container">
              <main className="main-content">
                <Navigate to="/team/login" replace />
              </main>
            </div>
          }
        />
        <Route
          path="/admin/login"
          element={
            <div className="app-container">
              <main className="main-content">
                <AdminLogin />
              </main>
            </div>
          }
        />
        <Route
          path="/team/login"
          element={
            <div className="app-container">
              <main className="main-content">
                <TeamLogin />
              </main>
            </div>
          }
        />

        {/* Protected Admin Routes with Sidebar & Topbar Layout */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/teams" element={<ManageTeams />} />
            <Route path="/admin/questions" element={<ManageQuestions />} />
            <Route path="/admin/results" element={<ViewResults />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Protected Candidate Test Routes */}
        <Route element={<ProtectedRoute requiredRole="team" />}>
          <Route
            path="/test"
            element={
              <div className="app-container">
                <main className="main-content">
                  <TestPage />
                </main>
              </div>
            }
          />
          <Route
            path="/submitted"
            element={
              <div className="app-container">
                <main className="main-content">
                  <SubmittedPage />
                </main>
              </div>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/team/login" replace />} />
      </Routes>
    </Router>
  );
}


