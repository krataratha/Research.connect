import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

/**
 * RoleGuard evaluates the user's role AFTER ProtectedRoute has 
 * handled authentication, loading states, and email verification.
 */
const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Safety check: if user is missing, don't render content.
  // (ProtectedRoute guarantees the user exists before rendering its children, 
  // but this prevents any momentary flashes or errors).
  if (!user) return null;

  // Check if the user's role is within the allowed list
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users to the default dashboard layout
    return <Navigate to="/dashboard" replace state={{ from: location, unauthorized: true }} />;
  }

  return children;
};

/**
 * RoleRoute is a higher-order route wrapper that first ensures the user is 
 * authenticated via ProtectedRoute, and then enforces role-based access control.
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={allowedRoles}>
        {children}
      </RoleGuard>
    </ProtectedRoute>
  );
};

export default RoleRoute;
