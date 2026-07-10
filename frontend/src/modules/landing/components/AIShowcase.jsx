import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, UserCheck, Sparkles, Star } from 'lucide-react';

const matches = [
  {
    id: 1,
    name: 'Prof. James Kim',
    role: 'ML Research Lead',
    institution: 'Stanford University',
    initials: 'JK',
    score: 94,
    interests: ['Deep Learning', 'NLP', 'Computer Vision'],
    color: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/30',
  },
  {
    id: 2,
    name: 'Dr. Priya Sharma',
    role: 'Quantum Computing',
    institution: 'MIT CSAIL',
    initials: 'PS',
    score: 88,
    interests: ['Quantum Algorithms', 'Cryptography', 'Optimization'],
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/30',
  },
  {
    id: 3,
    name: 'Dr. Lena Fischer',
    role: 'Bioinformatics',
    institution: 'ETH Zürich',
    initials: 'LF',
    score: 82,
    interests: ['Genomics', 'Protein Folding', 'ML in Biology'],
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/30',
  },
];

const MatchCard = ({ match, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15, duration: 0.6 }}
    whileHover={{ scale: 1.03, y: -4 }}
    className="glass-card rounded-2xl p-5 border border-white/10 group"
  >
    <div className="flex items-start gap-3 mb-4">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${match.color} shadow-lg ${match.glow} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
        {match.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold truncate">{match.name}</p>
        <p className="text-slate-500 text-xs truncate">{match.role}</p>
        <p className="text-slate-600 text-[10px] truncate">{match.institution}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-extrabold text-emerald-400">{match.score}%</span>
        <span className="text-[9px] text-slate-600">match</span>
      </div>
    </div>

    {/* Progress bar */}
    <div className="w-full bg-slate-800/60 rounded-full h-1.5 mb-3">
      <motion.div
        className={`h-1.5 rounded-full bg-gradient-to-r ${match.color}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${match.score}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: index * 0.15 + 0.3 }}
      />
    </div>

    {/* Interest tags */}
    <div className="flex flex-wrap gap-1.5">
      {match.interests.map(tag => (
        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
          {tag}
        </span>
      ))}
    </div>
  </motion.div>
);

const AIShowcase = () => (
  <section id="about" className="py-24 bg-[#030712] relative overflow-hidden">
    <div className="absolute inset-0 bg-dot-grid opacity-20" />
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Brain className="w-3.5 h-3.5" />
            AI-Powered Matching
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Let AI find your{' '}
            <span className="text-gradient">perfect collaborators</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Our vector-similarity engine analyzes your research interests, publication history, and citation network to surface the most relevant researchers and papers worldwide.
          </p>
          <ul className="space-y-3">
            {[
              { icon: TrendingUp, text: 'Citation graph analysis for co-author discovery', color: 'text-blue-400' },
              { icon: Sparkles, text: 'Semantic interest matching across 18K+ publications', color: 'text-indigo-400' },
              { icon: UserCheck, text: 'Personalized feed updated in real-time', color: 'text-emerald-400' },
            ].map(({ icon: Icon, text, color }) => (
              <li key={text} className="flex items-start gap-3 text-slate-300 text-sm">
                <Icon className={`w-4 h-4 ${color} mt-0.5 flex-shrink-0`} />
                {text}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right: Match cards */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-6"
          >
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 text-sm">Top researcher matches for you</span>
            <span className="ml-auto text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">Live AI</span>
          </motion.div>
          {matches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AIShowcase;
