import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  // Student Account Status & Verification Gatekeeper
  if (user.role === 'ROLE_STUDENT') {
    if (user.accountStatus !== 'ACTIVE' || !user.emailVerified || !user.profileCompleted) {
      let targetStep = 2;
      if (user.emailVerified && !user.profileCompleted) {
        targetStep = 3;
      }
      return <Navigate to="/register" state={{ resumeStep: targetStep, userId: user.id, email: user.email, mobileNumber: user.mobileNumber }} replace />;
    }
  }

  return children;
};
