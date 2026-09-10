import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ requiredRole, children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/team/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/team/login" replace />;
  }

  return children ? children : <Outlet />;
}
