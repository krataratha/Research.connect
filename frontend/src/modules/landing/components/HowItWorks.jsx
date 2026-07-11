import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Upload, Search, Handshake, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Create Your Research Profile',
    description: 'Build a comprehensive researcher profile with your expertise, publications, and research interests. Connect your Google Scholar and ORCID.',
    icon: UserPlus,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  {
    number: '02',
    title: 'Import Your Publications',
    description: 'Auto-sync from Google Scholar or manually upload PDFs. Our AI automatically extracts metadata, keywords, and citation counts.',
    icon: Upload,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    gradient: 'from-indigo-500/20 to-indigo-600/20',
  },
  {
    number: '03',
    title: 'Discover Researchers & Papers',
    description: 'AI-powered semantic search finds relevant papers and researchers matching your work. Explore citation networks and collaboration graphs.',
    icon: Search,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    gradient: 'from-violet-500/20 to-violet-600/20',
  },
  {
    number: '04',
    title: 'Collaborate & Grow',
    description: 'Connect with co-authors, join research workspaces, share datasets, and publish together. Track your impact with real-time analytics.',
    icon: Handshake,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    gradient: 'from-emerald-500/20 to-emerald-600/20',
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-[#030712] relative overflow-hidden">
    {/* Bg */}
    <div className="absolute inset-0 bg-dot-grid opacity-20" />
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-4">
          Simple Process
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Get started in <span className="text-gradient">4 simple steps</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          From profile creation to global collaboration — it's effortless.
        </p>
      </motion.div>

      {/* Desktop: horizontal timeline */}
      <div className="hidden lg:block">
        {/* Connecting line */}
        <div className="relative flex items-start gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.number}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex-1 flex flex-col items-center text-center px-4"
                >
                  {/* Step number + icon */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className={`w-7 h-7 ${step.color}`} />
                    </div>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${step.bg} border ${step.border} flex items-center justify-center text-[10px] font-extrabold ${step.color}`}>
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </motion.div>

                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
                    className="flex items-start pt-7"
                  >
                    <ArrowRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="lg:hidden space-y-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card rounded-2xl p-5 border ${step.border} flex gap-4`}
            >
              <div className={`w-12 h-12 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <div>
                <div className={`text-xs font-bold ${step.color} mb-1`}>Step {step.number}</div>
                <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default HowItWorks;
