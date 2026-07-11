import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Microscope, Building2, MapPin, ArrowRight, Layers, Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import collaborationsService from '../services/collaborations.service';

const STAGE_CONFIG = {
  Idea:      { bg: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  Proposal:  { bg: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  Ongoing:   { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Completed: { bg: 'bg-slate-100 text-slate-700 border-slate-200',   dot: 'bg-slate-400' },
};

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-purple-500 to-fuchsia-600',
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 overflow-hidden relative">
      <div className="flex justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse" />
        <div className="w-20 h-6 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="w-3/4 h-5 bg-slate-200 rounded-lg animate-pulse mb-3" />
      <div className="w-full h-4 bg-slate-200 rounded animate-pulse mb-2" />
      <div className="w-2/3 h-4 bg-slate-200 rounded animate-pulse mb-6" />
      <div className="border-t border-slate-100 pt-4 flex justify-between">
        <div className="w-24 h-5 bg-slate-200 rounded-md animate-pulse" />
        <div className="w-16 h-5 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

/* ── Delete Confirmation Modal ── */
function DeleteModal({ workspace, onConfirm, onCancel, isDeleting }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onCancel}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#64748B]" />
          </button>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-5"
          >
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </motion.div>

          <h2 className="text-xl font-extrabold text-[#0F172A] text-center mb-2">Delete Workspace?</h2>
          <p className="text-[#64748B] text-sm text-center leading-relaxed mb-2">
            You are about to permanently delete:
          </p>
          <p className="text-center font-bold text-[#0F172A] text-base mb-1">"{workspace?.name}"</p>
          <p className="text-[#94A3B8] text-xs text-center mb-7">
            This will delete all members, tasks, files, meetings, and activity. This action <strong className="text-red-500">cannot be undone</strong>.
          </p>

          {/* Type to confirm */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(239,68,68,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {isDeleting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                : <><Trash2 className="w-4 h-4" /> Yes, Delete It</>
              }
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main Page ── */
export default function MyWorkspaces() {
  const queryClient = useQueryClient();
  const [deletingWorkspace, setDeletingWorkspace] = useState(null);

  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ['my-collaborations'],
    queryFn:  () => collaborationsService.getMyCollaborations(),
    select:   (res) => res.data || [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => collaborationsService.deleteCollaboration(id),
    onSuccess: () => {
      toast.success('Workspace deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-collaborations'] });
      setDeletingWorkspace(null);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete workspace.');
    },
  });

  return (
    <div className="min-h-screen font-sans" style={{ background: '#F8FAFC' }}>
      {/* Delete Modal */}
      {deletingWorkspace && (
        <DeleteModal
          workspace={deletingWorkspace}
          isDeleting={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deletingWorkspace._id)}
          onCancel={() => !deleteMutation.isPending && setDeletingWorkspace(null)}
        />
      )}

      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">My Workspaces</h1>
            </div>
            <p className="text-[#64748B] text-sm ml-[52px]">Manage your collaborative research environments.</p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/collaborations/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-xl hover:shadow-blue-200 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
            >
              <Plus className="w-4 h-4" />
              New Workspace
            </Link>
          </motion.div>
        </motion.div>

        {/* Skeleton Loaders */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty State */}
        <AnimatePresence>
          {!isLoading && collaborations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-28 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-3xl bg-white border border-[#E2E8F0] shadow-lg flex items-center justify-center mb-6"
              >
                <Microscope className="w-10 h-10 text-[#2563EB]" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">No workspaces yet</h2>
              <p className="text-[#64748B] max-w-sm text-sm leading-relaxed">
                Create your first workspace to start collaborating with fellow researchers.
              </p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mt-7">
                <Link
                  to="/collaborations/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-xl hover:shadow-blue-200 transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace Grid */}
        {!isLoading && collaborations.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {collaborations.map((collab, idx) => {
              const ws = collab.workspace || collab;
              const stageConfig = STAGE_CONFIG[ws.researchStage] || STAGE_CONFIG.Ongoing;
              const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
              const isOwner = collab.myRole === 'Owner';

              return (
                <motion.div key={ws._id} variants={cardVariants} layout>
                  <div className="group relative bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#93C5FD] hover:shadow-[0_8px_30px_rgba(37,99,235,0.1)] transition-all duration-300 h-full flex flex-col overflow-hidden">

                    {/* Hover shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/40 group-hover:to-indigo-50/20 transition-all duration-500 rounded-2xl pointer-events-none" />

                    {/* Delete button — only for Owner, appears on hover */}
                    {isOwner && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.7 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.preventDefault(); setDeletingWorkspace(ws); }}
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    )}

                    {/* Card content as link */}
                    <Link to={`/collaborations/${ws.slug}`} className="flex flex-col flex-1 relative">
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          {ws.name?.charAt(0)?.toUpperCase() || 'W'}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${stageConfig.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stageConfig.dot}`} />
                          {ws.researchStage || 'Ongoing'}
                        </span>
                      </div>

                      {/* Name & Description */}
                      <h3 className="font-extrabold text-[17px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors duration-200 line-clamp-2 leading-snug mb-2">
                        {ws.name}
                      </h3>
                      {ws.description && (
                        <p className="text-[#64748B] text-sm line-clamp-2 leading-relaxed flex-1">
                          {ws.description}
                        </p>
                      )}

                      {/* Meta */}
                      {(ws.institution || ws.researchArea) && (
                        <div className="flex flex-wrap items-center gap-3 mt-4 text-[12px] text-[#94A3B8] font-medium">
                          {ws.institution && (
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5" />
                              {ws.institution}
                            </span>
                          )}
                          {ws.researchArea && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {ws.researchArea}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-[#64748B] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                          {collab.myRole || 'Member'}
                        </span>
                        <span className="text-xs font-bold text-[#2563EB] flex items-center gap-1 group-hover:gap-2.5 transition-all duration-300">
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
