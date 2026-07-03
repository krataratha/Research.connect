import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AuthenticatedNavbar from './Navbar/AuthenticatedNavbar';
import ProfileSidebar from '../modules/profile/components/ProfileSidebar';

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-bg-page text-text-primary">
      <AuthenticatedNavbar />
      <div className="flex flex-grow relative">
        <ProfileSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden fixed top-[76px] left-3 z-40 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg active:scale-95 transition-all"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <main className="flex-grow overflow-x-hidden p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;