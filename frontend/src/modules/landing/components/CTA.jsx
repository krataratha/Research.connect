import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const perks = [
  'Free forever on core features',
  'No credit card required',
  'Google Scholar sync',
  'AI-powered recommendations',
];

// Floating particles
const Particle = ({ style }) => (
  <div
    className="absolute rounded-full bg-indigo-500/20 border border-indigo-500/10"
    style={style}
  />
);

const particles = Array.from({ length: 12 }, (_, i) => ({
  width: Math.random() * 80 + 20,
  height: Math.random() * 80 + 20,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 4}s`,
  animationDuration: `${Math.random() * 6 + 4}s`,
}));

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section id="contact" className="py-24 bg-[#030712] relative overflow-hidden">
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-500/10 border border-indigo-500/10"
            style={{ width: p.width, height: p.height, top: p.top, left: p.left }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: parseFloat(p.animationDuration), delay: parseFloat(p.animationDelay), repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Join 1,400+ Researchers
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Start your research{' '}
            <span className="text-gradient animate-gradient-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
              journey today
            </span>
          </h2>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Join thousands of researchers worldwide who are accelerating their academic careers with Research Connect.
          </p>

          {/* Perks */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {perks.map(perk => (
              <div key={perk} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {perk}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all animate-pulse-glow"
            >
              <Sparkles className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              Create Free Account
              <ArrowRight className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </motion.button>
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-slate-300 glass-card border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/10 transition-all"
            >
              Sign In Instead
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
