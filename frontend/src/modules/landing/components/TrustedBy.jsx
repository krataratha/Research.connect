import React from 'react';
import { motion } from 'framer-motion';

const institutions = [
  { name: 'MIT', abbr: 'MIT', color: 'from-red-500/20 to-red-600/20 border-red-500/20 text-red-300' },
  { name: 'Stanford University', abbr: 'Stanford', color: 'from-red-600/20 to-orange-500/20 border-orange-500/20 text-orange-300' },
  { name: 'Harvard University', abbr: 'Harvard', color: 'from-red-700/20 to-red-500/20 border-red-600/20 text-red-300' },
  { name: 'Oxford University', abbr: 'Oxford', color: 'from-blue-800/20 to-blue-600/20 border-blue-500/20 text-blue-300' },
  { name: 'Cambridge University', abbr: 'Cambridge', color: 'from-blue-600/20 to-cyan-500/20 border-blue-400/20 text-blue-300' },
  { name: 'ETH Zürich', abbr: 'ETH', color: 'from-slate-600/20 to-slate-400/20 border-slate-400/20 text-slate-300' },
  { name: 'Caltech', abbr: 'Caltech', color: 'from-orange-600/20 to-amber-500/20 border-amber-400/20 text-amber-300' },
  { name: 'Princeton', abbr: 'Princeton', color: 'from-orange-500/20 to-orange-400/20 border-orange-400/20 text-orange-300' },
  { name: 'Carnegie Mellon', abbr: 'CMU', color: 'from-red-500/20 to-slate-500/20 border-slate-400/20 text-slate-300' },
  { name: 'Google Research', abbr: 'Google', color: 'from-blue-500/20 to-green-500/20 border-blue-400/20 text-blue-300' },
  { name: 'DeepMind', abbr: 'DeepMind', color: 'from-indigo-500/20 to-purple-500/20 border-indigo-400/20 text-indigo-300' },
  { name: 'OpenAI', abbr: 'OpenAI', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/20 text-emerald-300' },
];

const LogoCard = ({ inst }) => (
  <div className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r ${inst.color} border backdrop-blur-sm`}>
    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${inst.color} border flex items-center justify-center text-[10px] font-extrabold ${inst.color.split(' ').at(-1)}`}>
      {inst.abbr.substring(0, 2).toUpperCase()}
    </div>
    <span className={`text-sm font-semibold whitespace-nowrap ${inst.color.split(' ').at(-1)}`}>
      {inst.name}
    </span>
  </div>
);

const TrustedBy = () => {
  const doubled = [...institutions, ...institutions];

  return (
    <section id="researchers" className="py-16 bg-gradient-landing border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-slate-500 text-sm font-medium uppercase tracking-widest"
        >
          Trusted by researchers from world-class institutions
        </motion.p>
      </div>

      {/* Row 1 — left scroll */}
      <div className="relative">
        <div className="flex gap-4 animate-marquee" style={{ width: 'max-content' }}>
          {doubled.map((inst, i) => (
            <LogoCard key={i} inst={inst} />
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#030712] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#030712] to-transparent pointer-events-none z-10" />
      </div>

      <div className="mt-4 relative">
        <div className="flex gap-4 animate-marquee-reverse" style={{ width: 'max-content' }}>
          {[...doubled].reverse().map((inst, i) => (
            <LogoCard key={i} inst={inst} />
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#030712] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#030712] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};

export default TrustedBy;
