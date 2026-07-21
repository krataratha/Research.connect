import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AuthenticatedNavbar from './Navbar/AuthenticatedNavbar';
import ProfileSidebar from '../modules/profile/components/ProfileSidebar';

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Fix 1: Automatically close mobile sidebar on navigation/route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-bg-page text-text-primary">
      <AuthenticatedNavbar
        /* Fix 2: Use functional state update to avoid stale state bugs */
        onMenuClick={() => setIsMobileOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileOpen}
      />

      <div className="flex flex-1 min-h-0 relative">
        <ProfileSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
