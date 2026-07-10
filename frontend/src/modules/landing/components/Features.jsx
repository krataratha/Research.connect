import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Users, FileText, Sparkles, BarChart3, GraduationCap, Brain, Network, Shield, Zap, BookOpen, MessageSquare } from 'lucide-react';

const features = [
  {
    id: 'discovery',
    title: 'AI Research Discovery',
    description: 'Semantic search powered by vector embeddings finds research that textual keyword search can\'t. Our AI understands context, not just words.',
    icon: Sparkles,
    color: 'from-indigo-500/20 to-violet-500/20',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400',
    highlight: 'text-indigo-400',
    size: 'lg:col-span-2',
    badge: 'Core Feature',
  },
  {
    id: 'collaboration',
    title: 'Research Collaboration',
    description: 'Real-time workspace for co-authors. Draft papers together, share datasets, and track contributions.',
    icon: Users,
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    highlight: 'text-blue-400',
    size: '',
  },
  {
    id: 'publications',
    title: 'Publication Management',
    description: 'Upload, index, and manage all your academic publications. Track citations, downloads, and impact.',
    icon: FileText,
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    highlight: 'text-emerald-400',
    size: '',
  },
  {
    id: 'analytics',
    title: 'Research Analytics',
    description: 'Comprehensive dashboards tracking your research impact: h-index, citation curves, profile views, geographic reach.',
    icon: BarChart3,
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    highlight: 'text-amber-400',
    size: '',
  },
  {
    id: 'ai-recs',
    title: 'AI Recommendations',
    description: 'Personalized researcher and publication recommendations based on your interests, co-author network, and citation graph.',
    icon: Brain,
    color: 'from-violet-500/20 to-fuchsia-500/20',
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
    highlight: 'text-violet-400',
    size: '',
  },
  {
    id: 'scholar',
    title: 'Google Scholar Sync',
    description: 'Automatically import your publications and citation metrics from Google Scholar. Keep your profile always current.',
    icon: GraduationCap,
    color: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
    highlight: 'text-rose-400',
    size: '',
    badge: 'Coming Soon',
  },
  {
    id: 'network',
    title: 'Researcher Network',
    description: 'Build your academic network, follow leading researchers, discover collaboration opportunities globally.',
    icon: Network,
    color: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    highlight: 'text-cyan-400',
    size: 'lg:col-span-2',
  },
];

const FeatureCard = ({ feature, index }) => {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative glass-card rounded-2xl p-6 lg:p-7 border ${feature.border} ${feature.size} group overflow-hidden cursor-default`}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

      {/* Glow on hover */}
      <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10 blur-sm`} />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${feature.iconBg} border ${feature.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${feature.iconColor}`} />
          </div>
          {feature.badge && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${feature.iconBg} border ${feature.border} ${feature.iconColor}`}>
              {feature.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className={`text-lg font-bold text-white mb-2 group-hover:${feature.highlight} transition-colors`}>
          {feature.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          {feature.description}
        </p>

        {/* Arrow indicator */}
        <motion.div
          className={`mt-4 ${feature.iconColor} text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Learn more →
        </motion.div>
      </div>
    </motion.div>
  );
};

const Features = () => (
  <section id="features" className="py-24 bg-[#030712] relative overflow-hidden">
    <div className="absolute inset-0 bg-dot-grid opacity-20" />
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
          <Zap className="w-3.5 h-3.5" />
          Platform Capabilities
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Everything you need to{' '}
          <span className="text-gradient">accelerate research</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          A comprehensive suite of AI-powered tools designed specifically for researchers, academics, and institutions.
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {features.map((feature, i) => (
          <FeatureCard key={feature.id} feature={feature} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default Features;
