import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Is Research Connect free to use?',
    a: 'Research Connect offers a generous free tier with all core features including profile creation, publication management, semantic search, and researcher discovery. Premium plans with advanced analytics, unlimited collaborations, and API access are available for institutions.',
  },
  {
    q: 'How does the Google Scholar sync work?',
    a: 'Simply enter your Google Scholar profile URL. Our system automatically scrapes your publications, citation counts, h-index, and i10-index, then syncs them to your Research Connect profile. The sync runs automatically every 24 hours.',
  },
  {
    q: 'How does the AI researcher matching work?',
    a: 'We generate vector embeddings from your research interests, publication abstracts, and keyword tags. A cosine similarity algorithm then finds the most relevant researchers in our network. Match scores above 80% indicate highly compatible collaborators.',
  },
  {
    q: 'Is my research data secure?',
    a: 'Absolutely. We use AES-256 encryption at rest and TLS 1.3 in transit. All JWT tokens are rotated via refresh token rotation. Private publications are accessible only to you. We are GDPR-compliant and your data is never sold or shared.',
  },
  {
    q: 'Can I connect with researchers at other institutions?',
    a: 'Yes! Research Connect is designed for global collaboration. You can connect with researchers across 54+ countries, send collaboration requests, join open workspaces, and co-author papers regardless of institutional affiliation.',
  },
  {
    q: 'What publication formats are supported?',
    a: 'We support PDF uploads, DOI imports, BibTeX files, and automatic imports from Google Scholar, arXiv, and PubMed. Our AI extracts metadata including title, authors, abstract, keywords, journal, and citation counts automatically.',
  },
  {
    q: 'Is there an API for institutional integration?',
    a: 'Yes. Our REST API (v1) allows institutions to bulk-import researcher profiles, sync publication databases, and embed analytics dashboards. API documentation and sandbox access are available on the developer portal.',
  },
];

const FAQItem = ({ faq, index, isOpen, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.06 }}
    className="border-b border-white/5 last:border-none"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 py-5 text-left group"
    >
      <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
        {faq.q}
      </span>
      <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 rotate-0' : 'border-slate-700 text-slate-500 group-hover:border-slate-500'}`}>
        {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="pb-5 text-sm text-slate-400 leading-relaxed">
            {faq.a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 bg-[#030712] relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
          <p className="text-slate-400 text-lg">Everything you need to know about Research Connect.</p>
        </motion.div>

        <div className="glass-card rounded-2xl border border-white/10 px-6 lg:px-10">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
