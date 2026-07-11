import React from 'react';
import { motion } from 'framer-motion';
import { Shield, UserCog, User, GraduationCap, Eye, ExternalLink } from 'lucide-react';

const ROLE_CONFIG = {
  Owner:        { bg: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Shield,        gradient: 'from-amber-500 to-orange-500' },
  PI:           { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: UserCog,       gradient: 'from-purple-500 to-indigo-600' },
  'Co-PI':      { bg: 'bg-blue-50 text-blue-700 border-blue-200',       icon: UserCog,       gradient: 'from-blue-500 to-cyan-500' },
  RA:           { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',       icon: User,          gradient: 'from-cyan-500 to-teal-500' },
  Collaborator: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: User,       gradient: 'from-emerald-500 to-teal-600' },
  Student:      { bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: GraduationCap, gradient: 'from-orange-400 to-rose-500' },
  Admin:        { bg: 'bg-rose-50 text-rose-700 border-rose-200',       icon: Shield,        gradient: 'from-rose-500 to-pink-600' },
  Viewer:       { bg: 'bg-slate-100 text-slate-600 border-slate-200',   icon: Eye,           gradient: 'from-slate-400 to-slate-500' },
};

export default function MemberCard({ member, role }) {
  if (!member) return null;
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.Viewer;
  const RoleIcon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 35px rgba(37,99,235,0.1)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-[#93C5FD] transition-colors duration-200 relative overflow-hidden"
    >
      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:to-indigo-50/10 transition-all duration-500 pointer-events-none rounded-2xl" />

      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className={`w-13 w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0 overflow-hidden relative z-10`}
      >
        {member.avatar
          ? <img src={member.avatar} alt="" className="w-full h-full object-cover" />
          : member.firstName?.charAt(0)?.toUpperCase() || '?'}
      </motion.div>

      {/* Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <h3 className="text-[15px] font-extrabold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate mb-0.5">
          {member.firstName} {member.lastName}
        </h3>
        {member.headline && (
          <p className="text-xs text-[#64748B] truncate font-medium">{member.headline}</p>
        )}
        {member.username && (
          <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">@{member.username}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0 relative z-10">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-md border ${config.bg}`}>
          <RoleIcon className="w-3 h-3" />
          {role}
        </span>
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
        </motion.div>
      </div>
    </motion.div>
  );
}
