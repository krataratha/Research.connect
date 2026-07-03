import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Home, User, Compass, FileText, Briefcase,
  Users, MessageSquare, Bookmark, UserCheck,
  UserPlus, Settings, Upload, ChevronLeft,
  ChevronRight, BarChart2, Globe, Database, X
} from 'lucide-react';

const ProfileSidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useSelector((state) => state.auth);

  const profileSlug = username || user?.profileSlug || 'me';

  const links = [
    { name: 'Home Feed', path: '/', icon: Home, end: true },
    { name: 'Profile', path: `/profile/${profileSlug}`, icon: User, end: true },
    { name: 'Research Identity', path: `/profile/${profileSlug}/research-identity`, icon: Globe },
    { name: 'Publications', path: `/profile/${profileSlug}/publications`, icon: FileText },
    { name: 'Projects', path: `/profile/${profileSlug}/projects`, icon: Briefcase },
    { name: 'My Network', path: '/network', icon: Users },
    { name: 'Messages', path: `/profile/${profileSlug}/messages`, icon: MessageSquare },
    { name: 'Communities', path: '/communities', icon: Users },
    { name: 'Followers', path: `/profile/${profileSlug}/followers`, icon: UserCheck },
    { name: 'Following', path: `/profile/${profileSlug}/following`, icon: UserPlus },
    { name: 'Analytics', path: `/profile/${profileSlug}/analytics`, icon: BarChart2 },
    { name: 'Settings', path: `/profile/${profileSlug}/settings`, icon: Settings }
  ];

  const handleUploadPublication = () => {
    setIsMobileOpen(false);
    navigate('/publications/create');
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`bg-white border-r border-slate-200 h-full fixed top-0 left-0 z-[60] flex flex-col transition-transform duration-300 ease-out md:sticky md:top-[65px] md:h-[calc(100vh-65px)] md:z-30 md:translate-x-0 overflow-visible shadow-2xl md:shadow-none
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-8 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:bg-slate-50 hover:border-blue-300 transition-colors text-slate-500 z-20 hidden md:flex items-center justify-center"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className="flex md:hidden items-center justify-between px-4 h-16 border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
          <span className="font-bold text-sm text-slate-900">Menu</span>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-2 hidden md:block shrink-0" />

        <div className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    end={link.end}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      } ${isCollapsed ? 'md:justify-center' : ''}`
                    }
                    title={isCollapsed ? link.name : ''}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className={isCollapsed ? 'md:hidden' : ''}>{link.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50/60 shrink-0">
          <button
            onClick={handleUploadPublication}
            className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98] ${
              isCollapsed ? 'md:px-0' : 'px-4'
            }`}
            title="Upload Publication"
          >
            <Upload className="w-4 h-4 flex-shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Upload Publication</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProfileSidebar;