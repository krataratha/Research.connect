import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, BookOpen } from 'lucide-react';

const FooterCtaBanner = ({ onOpenChat }) => {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden py-16 px-8"
      style={{ background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full pointer-events-none"
        style={{
          transform: 'translate(-40%, -40%)',
          animation: 'hc-footer-blob 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full pointer-events-none"
        style={{
          transform: 'translate(40%, 40%)',
          animation: 'hc-footer-blob 14s ease-in-out infinite reverse',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2
          className="text-white font-bold text-[32px] leading-tight"
          style={{ animation: 'hc-fade-up 0.5s ease-out 0.1s both' }}
        >
          Couldn't find what you were looking for?
        </h2>
        <p
          className="text-white/75 text-base mt-4 leading-relaxed"
          style={{ animation: 'hc-fade-up 0.5s ease-out 0.2s both' }}
        >
          Our support team is ready to help. We typically respond within 2 hours.
        </p>
        <div
          className="flex flex-wrap justify-center gap-4 mt-8"
          style={{ animation: 'hc-fade-up 0.5s ease-out 0.3s both' }}
        >
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 bg-white text-[#2563EB] font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Support
          </button>
          <button
            onClick={() => navigate('/publications')}
            className="flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:bg-white/10"
          >
            <BookOpen className="w-5 h-5" />
            Browse Articles
          </button>
        </div>
      </div>

      <style>{`
        @keyframes hc-footer-blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes hc-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default FooterCtaBanner;
