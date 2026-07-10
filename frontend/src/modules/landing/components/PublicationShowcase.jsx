import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Star, Eye, Share2, Award, ArrowUpRight, BookOpen } from 'lucide-react';

const publications = [
  {
    id: 1,
    title: 'Attention Is All You Need',
    authors: 'A. Vaswani, N. Shazeer, N. Parmar, et al.',
    journal: 'Advances in Neural Information Processing Systems (NeurIPS)',
    year: 2023,
    citations: 120531,
    reads: '2.4M',
    type: 'Conference Paper',
    impact: 'High Impact',
    color: 'from-blue-500/10 to-indigo-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    tags: ['Transformer', 'Deep Learning', 'Attention Mechanism']
  },
  {
    id: 2,
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'K. He, X. Zhang, S. Ren, J. Sun',
    journal: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
    year: 2022,
    citations: 98241,
    reads: '1.8M',
    type: 'Conference Paper',
    impact: 'Highly Cited',
    color: 'from-emerald-500/10 to-teal-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    tags: ['ResNet', 'Computer Vision', 'Deep Learning']
  },
  {
    id: 3,
    title: 'Adam: A Method for Stochastic Optimization',
    authors: 'D. Kingma, J. Ba',
    journal: 'International Conference on Learning Representations (ICLR)',
    year: 2021,
    citations: 85112,
    reads: '1.5M',
    type: 'Journal Article',
    impact: 'Core Method',
    color: 'from-amber-500/10 to-orange-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-400',
    tags: ['Optimization', 'Stochastic Gradient Descent', 'AI Training']
  },
  {
    id: 4,
    title: 'Generative Adversarial Nets',
    authors: 'I. Goodfellow, J. Pouget-Abadie, M. Mirza, et al.',
    journal: 'Communications of the ACM',
    year: 2023,
    citations: 54109,
    reads: '1.1M',
    type: 'Journal Article',
    impact: 'Breakthrough',
    color: 'from-violet-500/10 to-purple-500/10',
    borderColor: 'border-violet-500/20',
    textColor: 'text-violet-400',
    tags: ['GANs', 'Generative Models', 'Unsupervised Learning']
  }
];

const PublicationShowcase = () => {
  return (
    <section className="py-24 bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Publication Library
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Showcase your research <span className="text-gradient">to the world</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Index your papers, track real-time citation metrics, and make your work easily discoverable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publications.map((pub, index) => (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`glass-card rounded-2xl p-6 border ${pub.borderColor} flex flex-col justify-between relative group cursor-pointer overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${pub.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 ${pub.textColor}`}>
                      {pub.type}
                    </span>
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      {pub.impact}
                    </span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors">
                    {pub.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">{pub.authors}</p>
                  <p className="text-slate-500 text-xs italic">{pub.journal} ({pub.year})</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {pub.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-white/5 text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Footer inside Card */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Citations: <strong className="text-white">{pub.citations.toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Reads: <strong className="text-white">{pub.reads}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Share2 className="w-3 h-3" />
                  <span>Share</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublicationShowcase;
