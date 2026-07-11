import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, Clock, AlertCircle, AlertTriangle, ArrowUpCircle, AlertOctagon } from 'lucide-react';

const PRIORITY_CONFIG = {
  Critical: { bg: 'bg-red-50 text-red-700 border-red-200',      bar: 'bg-red-500',    icon: AlertOctagon },
  High:     { bg: 'bg-orange-50 text-orange-700 border-orange-200', bar: 'bg-orange-500', icon: ArrowUpCircle },
  Medium:   { bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', bar: 'bg-yellow-500', icon: AlertTriangle },
  Low:      { bg: 'bg-slate-50 text-slate-600 border-slate-200',  bar: 'bg-slate-400',  icon: AlertCircle },
};

const STATUS_CONFIG = {
  Todo:        { bg: 'bg-slate-100 text-slate-700 border-slate-200',     icon: CircleDashed, progress: 0 },
  'In Progress':{ bg: 'bg-blue-50 text-blue-700 border-blue-200',         icon: Clock,        progress: 50 },
  'In Review':  { bg: 'bg-purple-50 text-purple-700 border-purple-200',   icon: AlertCircle,  progress: 75 },
  Done:         { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, progress: 100 },
  Blocked:      { bg: 'bg-red-50 text-red-700 border-red-200',            icon: AlertOctagon, progress: 0 },
};

export default function TaskCard({ task }) {
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG['Todo'];
  const priorityConfig = task.priority ? PRIORITY_CONFIG[task.priority] : null;
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(37,99,235,0.08)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group bg-white border border-[#E2E8F0] rounded-xl overflow-hidden cursor-pointer hover:border-[#93C5FD] transition-colors duration-200"
    >
      {/* Priority bar */}
      {priorityConfig && (
        <div className={`h-0.5 w-full ${priorityConfig.bar}`} />
      )}

      <div className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          {/* Status icon */}
          <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${statusConfig.bg}`}>
            <StatusIcon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors duration-200 line-clamp-1 mb-1">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-[#64748B] line-clamp-2 leading-relaxed mb-3">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md border ${statusConfig.bg}`}>
                <StatusIcon className="w-3 h-3" />
                {task.status || 'Todo'}
              </span>

              {/* Priority badge */}
              {priorityConfig && (
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityConfig.bg}`}>
                  {task.priority}
                </span>
              )}

              {/* Due date */}
              {task.dueDate && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#94A3B8] ml-auto">
                  <Clock className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar for in-progress tasks */}
        {statusConfig.progress > 0 && statusConfig.progress < 100 && (
          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${statusConfig.progress}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
