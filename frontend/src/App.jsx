import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Placeholders for Step 17 skeleton
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageTeams from './pages/ManageTeams';
import ManageQuestions from './pages/ManageQuestions';
import ViewResults from './pages/ViewResults';
import TeamLogin from './pages/TeamLogin';
import TestPage from './pages/TestPage';
import SubmittedPage from './pages/SubmittedPage';
import ProtectedRoute from './components/ProtectedRoute';




export default function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/team/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/team/login" element={<TeamLogin />} />
            
            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/teams" element={<ManageTeams />} />
              <Route path="/admin/questions" element={<ManageQuestions />} />
              <Route path="/admin/results" element={<ViewResults />} />
            </Route>

            {/* Protected Team Routes */}
            <Route element={<ProtectedRoute requiredRole="team" />}>
              <Route path="/test" element={<TestPage />} />
              <Route path="/submitted" element={<SubmittedPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/team/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

