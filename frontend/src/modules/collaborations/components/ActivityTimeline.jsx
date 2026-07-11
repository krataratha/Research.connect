import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, CheckCircle2, FileText, Calendar,
  Activity, MessageSquare, Zap
} from 'lucide-react';

const ACTION_CONFIG = {
  member_joined:     { icon: UserPlus,      bg: 'bg-purple-100', border: 'border-purple-200', color: 'text-purple-600', ring: 'shadow-purple-100' },
  task_created:      { icon: Activity,      bg: 'bg-blue-100',   border: 'border-blue-200',   color: 'text-blue-600',   ring: 'shadow-blue-100' },
  task_completed:    { icon: CheckCircle2,  bg: 'bg-emerald-100',border: 'border-emerald-200',color: 'text-emerald-600',ring: 'shadow-emerald-100' },
  file_uploaded:     { icon: FileText,      bg: 'bg-cyan-100',   border: 'border-cyan-200',   color: 'text-cyan-600',   ring: 'shadow-cyan-100' },
  meeting_scheduled: { icon: Calendar,      bg: 'bg-amber-100',  border: 'border-amber-200',  color: 'text-amber-600',  ring: 'shadow-amber-100' },
  message_sent:      { icon: MessageSquare, bg: 'bg-indigo-100', border: 'border-indigo-200', color: 'text-indigo-600', ring: 'shadow-indigo-100' },
  default:           { icon: Zap,           bg: 'bg-slate-100',  border: 'border-slate-200',  color: 'text-slate-600',  ring: 'shadow-slate-100' },
};

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function ActivityTimeline({ activities = [] }) {
  if (!activities.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-[#E2E8F0] rounded-2xl text-[#94A3B8]"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap className="w-10 h-10 opacity-30 mb-3" />
        </motion.div>
        <p className="font-semibold text-sm">No activity yet</p>
        <p className="text-xs mt-1 text-[#CBD5E1]">Actions within the workspace will appear here.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="font-extrabold text-[#0F172A] text-base mb-8">Activity Timeline</h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative"
      >
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#E2E8F0] via-[#BFDBFE] to-transparent" />

        <div className="space-y-6">
          {activities.map((activity, idx) => {
            const config = ACTION_CONFIG[activity.actionType] || ACTION_CONFIG.default;
            const Icon = config.icon;

            return (
              <motion.div
                key={activity._id || idx}
                variants={itemVariants}
                className="relative flex items-start gap-4 group"
              >
                {/* Icon node */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${config.bg} ${config.border} ${config.ring} group-hover:shadow-md transition-shadow`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </motion.div>

                {/* Content */}
                <motion.div
                  whileHover={{ x: 3 }}
                  className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 group-hover:border-[#BFDBFE] group-hover:shadow-sm transition-all duration-200"
                >
                  <p className="text-sm font-semibold text-[#0F172A] leading-snug mb-1">{activity.details}</p>
                  {activity.createdAt && (
                    <p className="text-[11px] font-medium text-[#94A3B8]">
                      {new Date(activity.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
