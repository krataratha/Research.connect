import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, FileText, TrendingUp, Brain, Star, CheckCircle2, Globe2 } from 'lucide-react';

/* ─── Floating mock card components ─── */
const ProfileCard = () => (
  <div className="glass-card rounded-2xl p-4 w-52 shadow-2xl shadow-black/40">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">AS</div>
      <div>
        <p className="text-white text-xs font-bold leading-tight">Dr. Alice S.</p>
        <p className="text-slate-400 text-[10px]">MIT · AI Research</p>
      </div>
    </div>
    <div className="flex gap-2">
      <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
        <p className="text-blue-400 text-xs font-bold">4.2K</p>
        <p className="text-slate-500 text-[9px]">Citations</p>
      </div>
      <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 text-center">
        <p className="text-indigo-400 text-xs font-bold">h-18</p>
        <p className="text-slate-500 text-[9px]">h-Index</p>
      </div>
    </div>
  </div>
);

const AIMatchCard = () => (
  <div className="glass-card rounded-2xl p-4 w-56 shadow-2xl shadow-black/40">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
        <Brain className="w-3.5 h-3.5 text-indigo-400" />
      </div>
      <p className="text-white text-xs font-bold">AI Match Found</p>
    </div>
    <div className="flex items-center justify-between mb-2">
      <p className="text-slate-400 text-[10px]">Prof. James K. · Stanford</p>
      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">94%</span>
    </div>
    <div className="w-full bg-slate-800 rounded-full h-1.5">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-1.5 rounded-full" style={{ width: '94%' }} />
    </div>
    <div className="flex flex-wrap gap-1 mt-2.5">
      {['Deep Learning', 'NLP', 'CV'].map(k => (
        <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{k}</span>
      ))}
    </div>
  </div>
);

const PublicationCard = () => (
  <div className="glass-card rounded-2xl p-4 w-60 shadow-2xl shadow-black/40">
    <div className="flex items-start gap-2 mb-2">
      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <FileText className="w-3 h-3 text-emerald-400" />
      </div>
      <p className="text-white text-xs font-semibold leading-snug">Attention Is All You Need</p>
    </div>
    <p className="text-slate-500 text-[10px] mb-3">NeurIPS 2023 · Transformer Architecture</p>
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-[10px]">Cited by <span className="text-white font-bold">120K+</span></span>
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
        <span className="text-amber-400 text-[10px] font-bold">4.9</span>
      </div>
    </div>
  </div>
);

const StatBubble = ({ value, label, color }) => (
  <div className={`glass-card rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg`}>
    <TrendingUp className={`w-3.5 h-3.5 ${color}`} />
    <div>
      <p className={`text-xs font-bold ${color}`}>{value}</p>
      <p className="text-slate-500 text-[9px]">{label}</p>
    </div>
  </div>
);

/* ─── Main Hero ─── */
const Hero = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(springY, [-300, 300], [8, -8]);
  const rotateY = useTransform(springX, [-300, 300], [-8, 8]);

  useEffect(() => {
    const handleMouse = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const words = ['Research', 'Collaboration', 'Discovery'];
  const [wordIndex, setWordIndex] = React.useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIndex(i => (i + 1) % words.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="hero" ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-landing">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-900/5 rounded-full blur-[150px]" />
        {/* Grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        {/* Top gradient line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left content ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Research Platform · 2026
            </motion.div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                <span className="text-white">The Future of</span>
                <br />
                <span className="block relative h-[1.1em] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      className="absolute inset-0 text-gradient"
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '-100%', opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                    >
                      {words[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-white">Starts Here</span>
              </h1>
            </div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-400 max-w-xl leading-relaxed"
            >
              An enterprise-grade AI-powered platform connecting researchers worldwide. 
              Discover publications, collaborate on projects, and sync your Google Scholar 
              metrics — all in one place.
            </motion.p>

            {/* Trust bullets */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 text-sm"
            >
              {[
                { icon: CheckCircle2, text: 'AI-Powered Recommendations', color: 'text-emerald-400' },
                { icon: Globe2, text: '50+ Countries', color: 'text-blue-400' },
                { icon: Users, text: '1,400+ Researchers', color: 'text-indigo-400' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-1.5 text-slate-400">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow animate-pulse-glow"
              >
                <Sparkles className="w-4 h-4" />
                Start for Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Social proof mini strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 pt-2"
            >
              <div className="flex -space-x-2">
                {['JD', 'AM', 'KR', 'PL', 'ST'].map((initials, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-300">
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                <span className="text-white font-semibold">1,400+</span> researchers already joined
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: floating visual cards ── */}
          <motion.div
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
            className="hidden lg:flex relative h-[580px] items-center justify-center"
          >
            {/* Center hub glow */}
            <div className="absolute w-48 h-48 bg-indigo-600/20 rounded-full blur-[60px]" />

            {/* Profile Card — top left */}
            <motion.div
              className="absolute top-12 left-0 z-10"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ProfileCard />
            </motion.div>

            {/* AI Match Card — top right */}
            <motion.div
              className="absolute top-4 right-0 z-10"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <AIMatchCard />
            </motion.div>

            {/* Publication Card — bottom center */}
            <motion.div
              className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <PublicationCard />
            </motion.div>

            {/* Stat bubbles */}
            <motion.div
              className="absolute bottom-36 left-4"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            >
              <StatBubble value="18,450" label="Publications" color="text-blue-400" />
            </motion.div>
            <motion.div
              className="absolute bottom-56 right-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            >
              <StatBubble value="54 Countries" label="Global Reach" color="text-emerald-400" />
            </motion.div>

            {/* Connection lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 580">
              <defs>
                <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0" />
                  <stop offset="50%" stopColor="rgb(99,102,241)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d="M120,90 Q250,200 380,80"
                stroke="url(#lineGrad1)" strokeWidth="1" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
              />
              <motion.path
                d="M120,90 Q200,300 250,450"
                stroke="url(#lineGrad1)" strokeWidth="1" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 1.5 }}
              />
              <motion.path
                d="M380,80 Q350,300 250,450"
                stroke="url(#lineGrad1)" strokeWidth="1" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 2 }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-slate-600 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center pt-1.5"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1 h-2 bg-indigo-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
