import React from 'react';
import { motion } from 'framer-motion';

const TrustedBy = () => {
  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
          Trusted by researchers at leading institutions worldwide
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden flex flex-col gap-6">
        
        {/* Row 1 */}
        <div className="flex w-max animate-ticker">
          {[...Array(2)].map((_, i) => (
            <div key={`row1-${i}`} className="flex items-center gap-16 px-8">
              {['Stanford University', 'MIT', 'Oxford', 'Cambridge', 'Harvard University', 'Caltech', 'ETH Zurich', 'IIT Bombay', 'IISc Bangalore', 'IIT Delhi', 'Yale University', 'Princeton University', 'Imperial College London', 'University of Tokyo', 'National University of Singapore', 'Tsinghua University', 'AIIMS Delhi', 'University of Toronto', 'TIFR', 'IIT Kanpur', 'IIT Madras'].map((uni, idx) => (
                <div key={idx} className="text-xl font-bold text-slate-300 whitespace-nowrap opacity-80 hover:opacity-100 hover:text-slate-800 transition-all cursor-default">
                  {uni}
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TrustedBy;
