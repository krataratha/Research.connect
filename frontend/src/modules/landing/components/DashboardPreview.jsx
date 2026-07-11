import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Layout, TrendingUp, Sparkles, Star, Users, Brain, Eye, Award } from 'lucide-react';

const chartData = [
  { name: 'Jan', Citations: 400, Reads: 2400 },
  { name: 'Feb', Citations: 600, Reads: 3000 },
  { name: 'Mar', Citations: 1000, Reads: 5000 },
  { name: 'Apr', Citations: 1400, Reads: 6200 },
  { name: 'May', Citations: 2000, Reads: 8500 },
  { name: 'Jun', Citations: 3100, Reads: 12000 },
  { name: 'Jul', Citations: 4200, Reads: 18450 },
];

const DashboardPreview = () => {
  return (
    <section className="py-24 bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Copy details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
              <Layout className="w-3.5 h-3.5" />
              Advanced Analytics
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              A command center for your{' '}
              <span className="text-gradient">academic impact</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Track citation trajectories, publication page views, download statistics, and co-author trends in real-time. Gain actionable insights about how your work is consumed and cited.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-4 border border-white/5">
                <TrendingUp className="w-5 h-5 text-indigo-400 mb-2" />
                <h4 className="text-white font-bold text-sm">Real-time Stats</h4>
                <p className="text-slate-500 text-xs mt-1">Automatic sync across indexing services.</p>
              </div>
              <div className="glass-card rounded-xl p-4 border border-white/5">
                <Sparkles className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-white font-bold text-sm">AI Predictions</h4>
                <p className="text-slate-500 text-xs mt-1">Predictive citation modeling and reach analysis.</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Simulated Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 bg-[#0b0f19] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Top row simulated window controls */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-slate-500 text-xs font-semibold ml-2">Alice Smith · Stanford University Dashboard</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md">Live Sync</span>
              </div>
            </div>

            {/* Simulated analytics cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#121824] rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Citations</span>
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h3 className="text-lg font-extrabold text-white">4,200</h3>
                <span className="text-[9px] text-emerald-400 font-semibold">+18% this month</span>
              </div>
              <div className="bg-[#121824] rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">h-Index</span>
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h3 className="text-lg font-extrabold text-white">18</h3>
                <span className="text-[9px] text-slate-500 font-semibold">Top 5% in NLP</span>
              </div>
              <div className="bg-[#121824] rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Reads</span>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-extrabold text-white">18.4K</h3>
                <span className="text-[9px] text-emerald-400 font-semibold">+12% this week</span>
              </div>
            </div>

            {/* Recharts chart container */}
            <div className="bg-[#121824] rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white text-xs font-bold">Citation & Read Impact Curve</h4>
                  <p className="text-slate-500 text-[10px]">Monthly growth index</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded bg-indigo-500" />
                    <span className="text-slate-400 text-[9px]">Citations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    <span className="text-slate-400 text-[9px]">Reads</span>
                  </div>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCitations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', fontSize: 9 }} />
                    <Area type="monotone" dataKey="Citations" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCitations)" />
                    <Area type="monotone" dataKey="Reads" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
