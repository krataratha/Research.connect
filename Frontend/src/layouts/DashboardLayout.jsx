import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderGit2,
  Handshake,
  MessageSquare,
  Bell,
  Bookmark,
  Users,
  Settings,
  Menu,
} from 'lucide-react';
import Navbar from '@/components/common/Navbar.jsx';
import Sidebar from '@/components/common/Sidebar.jsx';

/** Navigation items displayed in the dashboard sidebar. */
const sidebarItems = [
  { label: 'Dashboard',      to: '/dashboard',                icon: LayoutDashboard },
  { label: 'Publications',   to: '/dashboard/publications',   icon: BookOpen },
  { label: 'Projects',       to: '/dashboard/projects',       icon: FolderGit2 },
  { label: 'Collaborations', to: '/dashboard/collaborations', icon: Handshake },
  { label: 'Messages',       to: '/dashboard/messages',       icon: MessageSquare },
  { label: 'Notifications',  to: '/dashboard/notifications',  icon: Bell },
  { label: 'Bookmarks',      to: '/dashboard/bookmarks',      icon: Bookmark },
  { label: 'Community',      to: '/dashboard/community',      icon: Users },
  { label: 'Settings',       to: '/dashboard/settings',       icon: Settings },
];

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-brand-bg)]">
      {/* ─── Top Navbar (shared with MainLayout) ─── */}
      <div className="flex-shrink-0 relative z-40">
        {/* Mobile sidebar toggle — prepended inside the navbar row */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 lg:hidden z-50">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg text-[var(--color-brand-text-secondary)] hover:bg-[var(--color-brand-light-blue)] hover:text-[var(--color-brand-blue)] transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <Navbar />
      </div>

      {/* ─── Below navbar: sidebar + main content ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
