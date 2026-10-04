import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminProtectedRoute = ({ children }) => {
  const { adminUser } = useAuth();
  const location = useLocation();

  if (!adminUser || !adminUser.token || adminUser.role !== 'ROLE_ADMIN') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};
