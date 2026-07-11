import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from '@/components/common/Loading.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-bg)]">
        <Loading message="Syncing session..." />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If email is not verified, redirect to verify-email
  if (user.emailVerified === false) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email || '')}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
