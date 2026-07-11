import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    role: 'Associate Professor, Machine Learning',
    institution: 'MIT CSAIL',
    initials: 'SC',
    color: 'from-blue-500 to-indigo-600',
    rating: 5,
    quote: 'Research Connect completely transformed how I discover papers. The semantic search finds papers that keyword search simply cannot. My h-index improved by 3 points in 6 months after connecting with the right collaborators.',
    metrics: { value: '+3 h-index', period: 'in 6 months' }
  },
  {
    id: 2,
    name: 'Prof. James Okafor',
    role: 'Director, Computational Biology Lab',
    institution: 'University of Oxford',
    initials: 'JO',
    color: 'from-violet-500 to-purple-600',
    rating: 5,
    quote: 'The Google Scholar sync was the killer feature for me. My entire publication catalog was imported instantly. The AI then immediately matched me with three collaborators who are now co-authors on two papers.',
    metrics: { value: '2 papers', period: 'from AI matches' }
  },
  {
    id: 3,
    name: 'Dr. Ananya Krishnan',
    role: 'Postdoctoral Researcher',
    institution: 'Stanford HAI',
    initials: 'AK',
    color: 'from-emerald-500 to-teal-600',
    rating: 5,
    quote: 'As a postdoc, networking is everything. Research Connect is LinkedIn for academics, but actually built for us. The research profile is comprehensive, and the collaboration workspace is incredible.',
    metrics: { value: '12 collaborators', period: 'connected globally' }
  },
  {
    id: 4,
    name: 'Prof. Michael Bauer',
    role: 'Department Head, Physics',
    institution: 'ETH Zürich',
    initials: 'MB',
    color: 'from-amber-500 to-orange-600',
    rating: 5,
    quote: 'Our entire physics department now uses Research Connect. The institutional dashboard gives me aggregate analytics across all researchers, and collaboration workspaces have replaced email-based coordination entirely.',
    metrics: { value: '40+ researchers', period: 'in our department' }
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(i => (i + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="py-24 bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            Researcher Voices
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Loved by <span className="text-gradient">researchers worldwide</span>
          </h2>
          <p className="text-slate-400 text-lg">Real stories from researchers using Research Connect.</p>
        </motion.div>

        {/* Main Testimonial */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card rounded-3xl p-8 lg:p-12 border border-white/10"
            >
              <Quote className="w-10 h-10 text-indigo-400/30 mb-6" />
              <p className="text-white text-xl lg:text-2xl font-medium leading-relaxed mb-8">
                "{t.quote}"
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-bold">{t.name}</p>
                    <p className="text-slate-400 text-sm">{t.role}</p>
                    <p className="text-slate-600 text-xs">{t.institution}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-lg">{t.metrics.value}</p>
                    <p className="text-slate-600 text-xs">{t.metrics.period}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full glass-card border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-indigo-500' : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full glass-card border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
