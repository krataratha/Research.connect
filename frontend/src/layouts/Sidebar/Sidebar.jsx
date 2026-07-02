import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSuccess } from '../../redux/slices/authSlice';
import authService from '../../services/auth.service';
import { 
  Home, User, Compass, FileText, Briefcase, 
  Users, MessageSquare, Bell, Bookmark, UserCheck, 
  UserPlus, Settings, LogOut, Upload, ChevronLeft, 
  ChevronRight, Share2, BarChart2, Globe, Database, HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const links = [
    { name: 'Home Feed', path: '/', icon: Home },
    { name: 'Profile', path: user?.profileSlug ? `/profile/${user.profileSlug}` : '/profile', icon: User },
    { name: 'Research Identity', path: '/research-identity', icon: Globe },
    { name: 'Publications', path: user?.profileSlug ? `/profile/${user.profileSlug}/publications` : '/profile', icon: FileText },
    { name: 'Projects', path: user?.profileSlug ? `/profile/${user.profileSlug}/projects` : '/profile', icon: Briefcase },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Datasets', path: user?.profileSlug ? `/profile/${user.profileSlug}/datasets` : '/profile', icon: Database },
    { name: 'Communities', path: '/communities', icon: Users },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Saved', path: '/bookmarks', icon: Bookmark },
    { name: 'Followers', path: '/followers', icon: UserCheck },
    { name: 'Following', path: '/following', icon: UserPlus },
    { name: 'Analytics', path: user?.profileSlug ? `/profile/${user.profileSlug}/analytics` : '/profile', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      dispatch(logoutSuccess());
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const handleUploadPublication = () => {
    navigate('/publications/create');
  };

  return (
    <aside 
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-65px)] sticky top-[65px] flex-col justify-between transition-all duration-300 z-30 hidden md:flex overflow-y-auto scrollbar-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500 z-40"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar Spacer (Logo removed) */}
        <div className="h-14 flex items-center justify-center" />

        {/* Navigation List */}
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
          <ul className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      } ${isCollapsed ? 'justify-center' : ''}`
                    }
                    title={isCollapsed ? link.name : ''}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span>{link.name}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Sidebar Footer Operations */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-950/20">
        {!isCollapsed ? (
          <button
            onClick={handleUploadPublication}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Publication</span>
          </button>
        ) : (
          <button
            onClick={handleUploadPublication}
            className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
            title="Upload Publication"
          >
            <Upload className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
