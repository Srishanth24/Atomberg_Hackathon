import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute Wrapper
 * Ensures that users can only access routes permitted by their role.
 */
const ProtectedRoute = ({ allowedRoles, currentRole }) => {
  const location = useLocation();

  // If no role is set, redirect to login
  if (!currentRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not allowed, redirect to Unauthorized
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
