import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Microscope } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Premium Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-6 relative z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Microscope className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-display text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
              ResearchConnect
            </span>
          </Link>
        </div>

        {/* Glassmorphic Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white/80 backdrop-blur-md border border-slate-200/55 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-slate-200/40"
        >
          <Outlet />
        </motion.div>

        {/* Simple Premium Footer */}
        <div className="flex justify-center items-center gap-4 text-xs text-slate-400 mt-6 font-semibold">
          <span>Connecting Global Scientific Minds</span>
          <span>&bull;</span>
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
