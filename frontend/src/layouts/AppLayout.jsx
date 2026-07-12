import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AuthenticatedNavbar from './Navbar/AuthenticatedNavbar';
import ProfileSidebar from '../modules/profile/components/ProfileSidebar';

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen min-h-screen overflow-hidden bg-bg-page text-text-primary">
      <AuthenticatedNavbar />

      <div className="flex flex-1 flex-grow min-h-0 relative">
        <ProfileSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden fixed top-[69px] left-2 z-30 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg active:scale-95 transition-all"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <main className="flex-1 flex-grow min-w-0 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;