import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute Wrapper
 * Ensures that users can only access routes permitted by their role.
 * Stable across role switches with strict validation.
 */
const ProtectedRoute = ({ allowedRoles, currentRole }) => {
  const location = useLocation();
  const token = localStorage.getItem('authToken');
  const storedRole = localStorage.getItem('userRole');

  // Use stored role as source of truth (updated on login)
  const userRole = storedRole;

  // If no token or role, redirect to login
  if (!token || !userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not allowed, redirect to Unauthorized
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
