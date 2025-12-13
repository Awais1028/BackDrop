import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, role } = useAuth();

  if (!user) {
    // User not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // User authenticated but not authorized for this role, redirect to home or a 403 page
    return <Navigate to="/" replace />; // Or a specific unauthorized page
  }

  return <Outlet />;
};

export default ProtectedRoute;