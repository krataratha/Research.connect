import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Authenticated users see HomeFeed at /home
// Guests see LandingPage at /
const HomeHub = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Guest: render full landing page (LandingPage includes its own Navbar and Footer)
  const LandingPage = React.lazy(() => import('../modules/landing/pages/LandingPage'));
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LandingPage />
    </React.Suspense>
  );
};

export default HomeHub;