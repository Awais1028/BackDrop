import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Settings } from 'lucide-react'; // Import Settings icon for loading

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, role, isLoading } = useAuth(); // Get isLoading from context

  if (isLoading) {
    // Show a loading spinner while AuthContext is initializing
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="mb-8">
          <Settings
            className="w-16 h-16 text-gray-400 animate-spin"
            style={{ animationDuration: "3s" }}
          />
        </div>
        <h1 className="text-xl font-medium text-gray-300 text-center max-w-md">
          Verifying access...
        </h1>
      </div>
    );
  }

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