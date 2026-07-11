import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Eye } from 'lucide-react';
import { TUTORIALS } from '../data/helpCenterData';

// Map tutorial to a meaningful route
const TUTORIAL_ROUTES = {
  'tut-1': '/publications/create',
  'tut-2': '/publications',
  'tut-3': '/collaborations',
};

const VideoCard = ({ tutorial, index, isVisible }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(TUTORIAL_ROUTES[tutorial.id] || '/help')}
      className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden cursor-pointer transition-all duration-250"
      style={{
        opacity: isVisible ? 1 : 0,
        animation: isVisible
          ? `hc-card-rise 0.5s cubic-bezier(0.34,1.2,0.64,1) ${index * 120}ms both`
          : 'none',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 12px 32px rgba(37,99,235,0.10)'
          : '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height: '176px', background: tutorial.thumbnailGradient }}
      >
        {hovered && (
          <div
            className="absolute rounded-full"
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.4)',
              animation: 'hc-pulse-ring 1s ease-out infinite',
            }}
          />
        )}
        <PlayCircle
          className="text-white relative z-10 transition-transform duration-200"
          style={{
            width: '48px',
            height: '48px',
            transform: hovered ? 'scale(1.2)' : 'scale(1)',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
          }}
        />
        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-medium">
          {tutorial.duration}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <span
          className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold mb-2"
          style={{ background: tutorial.categoryBg, color: tutorial.categoryColor }}
        >
          {tutorial.category}
        </span>
        <h3 className="text-[#0F172A] font-semibold text-[15px] leading-snug line-clamp-2">
          {tutorial.title}
        </h3>
        <p className="text-[#475569] text-sm mt-1 line-clamp-2 leading-relaxed">
          {tutorial.description}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
            <Eye className="w-3.5 h-3.5" />
            {tutorial.views}
          </span>
          <span className="text-[#94A3B8] text-xs">&middot;</span>
          <span className="text-xs text-[#94A3B8]">{tutorial.date}</span>
        </div>
      </div>
    </div>
  );
};

const VideoTutorialsRow = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white py-16 px-8 border-t border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <h2
            className="text-[#0F172A] font-bold text-2xl"
            style={{
              opacity: isVisible ? 1 : 0,
              animation: isVisible ? 'hc-fade-up 0.5s ease-out 0s both' : 'none',
            }}
          >
            Video Tutorials
          </h2>
          <button
            onClick={() => navigate('/publications')}
            className="text-[#2563EB] text-sm font-medium hover:underline transition-colors"
            style={{
              opacity: isVisible ? 1 : 0,
              animation: isVisible ? 'hc-fade-in 0.5s ease-out 0.1s both' : 'none',
            }}
          >
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {TUTORIALS.map((tutorial, i) => (
            <VideoCard key={tutorial.id} tutorial={tutorial} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hc-card-rise {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hc-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hc-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hc-pulse-ring {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default VideoTutorialsRow;
