import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Placeholders for Step 17 skeleton
const AdminLogin = () => <div className="glass-card">Admin Login Placeholder</div>;
const AdminDashboard = () => <div className="glass-card">Admin Dashboard Placeholder</div>;
const ManageTeams = () => <div className="glass-card">Manage Teams Placeholder</div>;
const ManageQuestions = () => <div className="glass-card">Manage Questions Placeholder</div>;
const ViewResults = () => <div className="glass-card">View Results Placeholder</div>;
const TeamLogin = () => <div className="glass-card">Team Login Placeholder</div>;
const TestPage = () => <div className="glass-card">Test Page Placeholder</div>;
const SubmittedPage = () => <div className="glass-card">Submitted Page Placeholder</div>;

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/team/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/teams" element={<ManageTeams />} />
            <Route path="/admin/questions" element={<ManageQuestions />} />
            <Route path="/admin/results" element={<ViewResults />} />
            <Route path="/team/login" element={<TeamLogin />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/submitted" element={<SubmittedPage />} />
            <Route path="*" element={<Navigate to="/team/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
