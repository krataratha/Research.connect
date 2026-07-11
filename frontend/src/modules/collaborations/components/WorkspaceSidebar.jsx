import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CheckSquare, Folder,
  CalendarDays, Zap, MessageSquare, Building2, Timer, ChevronRight
} from 'lucide-react';

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'members',   label: 'Members',   icon: Users },
  { id: 'tasks',     label: 'Tasks',     icon: CheckSquare },
  { id: 'files',     label: 'Files',     icon: Folder },
  { id: 'meetings',  label: 'Meetings',  icon: CalendarDays },
  { id: 'activity',  label: 'Activity',  icon: Zap },
  { id: 'messages',  label: 'Messages',  icon: MessageSquare },
];

const ROLE_CONFIG = {
  Owner:        { bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  PI:           { bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Co-PI':      { bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  RA:           { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  Collaborator: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Student:      { bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  Admin:        { bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  Viewer:       { bg: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function WorkspaceSidebar({ workspace, myRole, activeTab, setActiveTab }) {
  const roleStyle = ROLE_CONFIG[myRole] || ROLE_CONFIG.Viewer;

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-64 flex-shrink-0 border-r border-[#E2E8F0] bg-white flex flex-col"
    >
      {/* Workspace Identity */}
      <div className="px-5 pt-6 pb-5 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.12, rotate: 6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 15 }}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0"
          >
            {workspace?.name?.charAt(0)?.toUpperCase() || 'W'}
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-extrabold text-[#0F172A] truncate leading-tight">
              {workspace?.name}
            </p>
            {myRole && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mt-1 ${roleStyle.bg}`}
              >
                {myRole}
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx + 0.15, duration: 0.35, ease: 'easeOut' }}
              onClick={() => setActiveTab(tab.id)}
              className="w-full relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-left transition-colors duration-200 group overflow-hidden"
              style={{ color: isActive ? '#2563EB' : '#475569' }}
            >
              {/* Active background */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              <Icon className="w-4 h-4 relative z-10 flex-shrink-0" />
              <span className="relative z-10 flex-1">{tab.label}</span>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative z-10"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#2563EB]" />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      {(workspace?.institution || workspace?.expectedDuration) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="px-5 py-4 border-t border-[#F1F5F9] space-y-2"
        >
          {workspace?.institution && (
            <p className="text-[11px] font-semibold text-[#64748B] truncate flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-[#94A3B8]" />
              {workspace.institution}
            </p>
          )}
          {workspace?.expectedDuration && (
            <p className="text-[11px] font-semibold text-[#64748B] flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 flex-shrink-0 text-[#94A3B8]" />
              {workspace.expectedDuration}
            </p>
          )}
        </motion.div>
      )}
    </motion.aside>
  );
}
