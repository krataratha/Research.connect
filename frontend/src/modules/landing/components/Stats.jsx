import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../api/axiosInstance';
import { Users, BookOpenCheck, Globe, Handshake, Award, TrendingUp } from 'lucide-react';

const stats = [
  { key: 'researchers', label: 'Registered Researchers', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', fallback: 1422, suffix: '+', description: 'Active globally' },
  { key: 'publications', label: 'Indexed Publications', icon: BookOpenCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', fallback: 18450, suffix: '+', description: 'Peer-reviewed works' },
  { key: 'countries', label: 'Represented Countries', icon: Globe, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', fallback: 54, suffix: '', description: 'Worldwide reach' },
  { key: 'universities', label: 'Partner Institutions', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', fallback: 116, suffix: '+', description: 'Top universities' },
];

const AnimatedCounter = ({ value, suffix = '', duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && !hasAnimated.current && ref.current) {
      hasAnimated.current = true;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(obj.val).toLocaleString() + suffix;
          }
        },
      });
    }
  }, [inView, value, suffix, duration]);

  return <span ref={ref}>0{suffix}</span>;
};

const Stats = () => {
  const { data } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/stats');
      return res.data?.data || res.data;
    },
    retry: false,
  });

  return (
    <section className="py-24 bg-[#030712] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            Growing Every Day
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            The numbers speak for themselves
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join a thriving global research community driving scientific discovery forward.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const rawValue = data?.[`${stat.key}Count`] ?? data?.[stat.key] ?? stat.fallback;
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className={`glass-card rounded-2xl p-6 lg:p-8 border ${stat.border} group cursor-default`}
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-4xl lg:text-5xl font-extrabold ${stat.color} mb-2 font-['Outfit'] tracking-tight`}>
                  <AnimatedCounter value={rawValue} suffix={stat.suffix} />
                </div>
                <p className="text-white font-semibold text-sm mb-1">{stat.label}</p>
                <p className="text-slate-500 text-xs">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
