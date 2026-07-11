import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckSquare, FileText, CalendarDays, Settings,
  UserPlus, Plus, ArrowLeft, Loader2, AlertTriangle
} from 'lucide-react';
import collaborationsService from '../services/collaborations.service';
import WorkspaceSidebar from '../components/WorkspaceSidebar';
import ActivityTimeline from '../components/ActivityTimeline';
import MemberCard from '../components/MemberCard';
import TaskCard from '../components/TaskCard';

const tabVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const STAT_CONFIG = [
  { key: 'members', label: 'Members',  color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', icon: Users },
  { key: 'tasks',   label: 'Tasks',    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: CheckSquare },
  { key: 'files',   label: 'Files',    color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200',icon: FileText },
  { key: 'meetings',label: 'Meetings', color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: CalendarDays },
];

export default function WorkspaceOverview() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['collaboration', slug],
    queryFn:  () => collaborationsService.getCollaborationBySlug(slug),
    select:   (res) => res.data,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-[#64748B]">Loading workspace…</p>
        </motion.div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#F8FAFC' }}
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-20 h-20 bg-white border border-[#E2E8F0] rounded-2xl shadow-md flex items-center justify-center"
        >
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </motion.div>
        <h2 className="text-xl font-extrabold text-[#0F172A]">Workspace Not Found</h2>
        <p className="text-[#64748B] text-sm">This workspace doesn't exist or you don't have access.</p>
        <Link
          to="/collaborations"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-xl transition-all"
          style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspaces
        </Link>
      </motion.div>
    );
  }

  const { workspace, myRole, members, tasks, files, activities, meetings } = data;

  const stats = STAT_CONFIG.map(s => ({
    ...s,
    value: s.key === 'members' ? members?.length
         : s.key === 'tasks'   ? tasks?.length
         : s.key === 'files'   ? files?.length
         : meetings?.length || 0,
  }));

  return (
    <div className="min-h-screen font-sans flex" style={{ background: '#F8FAFC' }}>
      <WorkspaceSidebar workspace={workspace} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-y-auto">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-white border-b border-[#E2E8F0] px-6 md:px-10 py-8"
        >
          {/* Subtle gradient orb */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-40 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg"
                >
                  {workspace.name?.charAt(0)?.toUpperCase() || 'W'}
                </motion.div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">{workspace.name}</h1>
                  {workspace.title && <p className="text-[#64748B] text-sm mt-0.5">{workspace.title}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: workspace.researchStage, bg: 'bg-violet-50 text-violet-700 border-violet-200' },
                  { label: workspace.visibility,    bg: 'bg-blue-50   text-blue-700   border-blue-200' },
                  { label: workspace.fundingStatus, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: `Role: ${myRole}`,       bg: 'bg-amber-50  text-amber-700  border-amber-200' },
                ].map(({ label, bg }) => (
                  <motion.span
                    key={label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${bg}`}
                  >
                    {label}
                  </motion.span>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex gap-3 flex-shrink-0"
            >
              {(myRole === 'Owner' || myRole === 'Admin') && (
                <motion.button
                  whileHover={{ scale: 1.03 }}  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/collaborations/${slug}/settings`)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(37,99,235,0.25)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
              >
                <UserPlus className="w-4 h-4" />
                Invite Members
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-10 py-6"
        >
          {stats.map(({ key, label, value, color, bg, border, icon: Icon }) => (
            <motion.div
              key={key}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.07)' }}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-5 text-center transition-shadow cursor-default"
            >
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${bg} border ${border}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className={`text-3xl font-black ${color}`}
              >
                {value || 0}
              </motion.p>
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Content */}
        <div className="px-6 md:px-10 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {workspace.description && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
                      <h2 className="font-extrabold text-[#0F172A] mb-3 text-base">About this Workspace</h2>
                      <p className="text-[#475569] text-sm leading-relaxed whitespace-pre-wrap">{workspace.description}</p>
                    </div>
                  )}
                  {tasks?.length > 0 && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
                      <h2 className="font-extrabold text-[#0F172A] mb-4 text-base">Recent Tasks</h2>
                      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                        {tasks.slice(0, 5).map(task => (
                          <motion.div key={task._id} variants={itemVariants}>
                            <TaskCard task={task} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'members' && (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {members?.map(m => (
                    <motion.div key={m._id} variants={itemVariants}>
                      <MemberCard member={m.userId} role={m.role} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-extrabold text-[#0F172A] text-base">All Tasks</h2>
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
                    >
                      <Plus className="w-4 h-4" /> Add Task
                    </motion.button>
                  </div>
                  {tasks?.length === 0 && (
                    <div className="text-center py-16 text-[#94A3B8] bg-white border border-dashed border-[#E2E8F0] rounded-2xl">
                      No tasks yet. Click + Add Task to create one.
                    </div>
                  )}
                  {tasks?.map(task => (
                    <motion.div key={task._id} variants={itemVariants}>
                      <TaskCard task={task} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <ActivityTimeline activities={activities} />
              )}

              {activeTab === 'files' && (
                <div className="text-center py-20 text-[#94A3B8] bg-white border border-dashed border-[#E2E8F0] rounded-2xl">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-semibold">No files uploaded yet.</p>
                </div>
              )}

              {activeTab === 'meetings' && (
                <div>
                  {meetings?.length === 0 ? (
                    <div className="text-center py-20 text-[#94A3B8] bg-white border border-dashed border-[#E2E8F0] rounded-2xl">
                      <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="font-semibold">No meetings scheduled yet.</p>
                    </div>
                  ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {meetings?.map(m => (
                        <motion.div
                          key={m._id}
                          variants={itemVariants}
                          whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.07)' }}
                          className="bg-white border border-[#E2E8F0] rounded-2xl p-5 transition-all"
                        >
                          <p className="font-bold text-[#0F172A] mb-1">{m.title}</p>
                          <p className="text-xs text-[#64748B] font-medium">
                            {m.date ? new Date(m.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="text-center py-20 text-[#94A3B8] bg-white border border-dashed border-[#E2E8F0] rounded-2xl">
                  <p className="font-semibold">Messages coming soon.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="hidden xl:flex flex-col w-80 border-l border-[#E2E8F0] bg-white overflow-y-auto"
      >
        <div className="p-6 space-y-8">
          {/* Quick Actions */}
          <div>
            <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Invite Member', icon: UserPlus, color: 'text-violet-600 bg-violet-50 border-violet-200' },
                { label: 'Add Task',      icon: Plus,     color: 'text-blue-600   bg-blue-50   border-blue-200' },
                { label: 'Upload File',   icon: FileText, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                { label: 'Schedule Meeting', icon: CalendarDays, color: 'text-amber-600 bg-amber-50 border-amber-200' },
              ].map(({ label, icon: Icon, color }) => (
                <motion.button
                  key={label}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 text-sm font-semibold px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] text-[#0F172A] hover:text-[#2563EB] transition-all duration-200"
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center border ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Upcoming Meetings */}
          {meetings?.length > 0 && (
            <div>
              <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-4">Upcoming Meetings</h3>
              <div className="space-y-3">
                {meetings.slice(0, 3).map(m => (
                  <motion.div
                    key={m._id}
                    whileHover={{ x: 3 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#BFDBFE] transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0F172A] truncate">{m.title}</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {m.date ? new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div>
            <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-4">Recent Activity</h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-[#E2E8F0]">
              {(activities || []).slice(0, 5).map((a, idx) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                  className="flex gap-3 pl-1 relative"
                >
                  <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 border-2 border-[#2563EB]/30 flex-shrink-0 z-10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#475569] leading-snug font-medium">{a.details}</p>
                    {a.createdAt && (
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">
                        {new Date(a.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
