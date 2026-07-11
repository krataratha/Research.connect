import React, { useEffect, useRef, useState } from 'react';
import {
  Rocket,
  Upload,
  UserCog,
  Users,
  ChevronRight,
} from 'lucide-react';
import { CATEGORIES } from '../data/helpCenterData';

const ICON_MAP = { Rocket, Upload, UserCog, Users };

// Map category id → the tab label used in PopularArticles
const CATEGORY_TO_TAB = {
  'getting-started': 'Getting Started',
  'publishing': 'Publishing',
  'account': 'Account',
  'collaboration': 'Collaboration',
};

const CategoryCard = ({ cat, index, isVisible, onSelect }) => {
  const Icon = ICON_MAP[cat.iconName] || Rocket;
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
      // Tell parent which tab to activate + scroll to articles section
      onSelect(CATEGORY_TO_TAB[cat.id]);
    }, 150);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="bg-white rounded-2xl p-6 cursor-pointer border border-[#E2E8F0] transition-all duration-300 flex flex-col focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
      style={{
        opacity: isVisible ? 1 : 0,
        animation: isVisible
          ? `hc-card-rise 0.5s cubic-bezier(0.34,1.2,0.64,1) ${index * 100}ms both`
          : 'none',
        transform: clicked
          ? 'scale(0.98)'
          : hovered
          ? 'translateY(-6px)'
          : 'translateY(0) scale(1)',
        borderColor: hovered ? cat.accentBorder : '#E2E8F0',
        boxShadow: hovered
          ? '0 12px 32px rgba(0,0,0,0.10)'
          : '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200"
        style={{
          background: cat.iconBg,
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <Icon style={{ color: cat.iconColor }} className="w-6 h-6" />
      </div>

      <h3 className="text-[#0F172A] font-bold text-[17px] mt-4">{cat.name}</h3>

      <p className="text-[#475569] text-[13px] mt-1 leading-relaxed line-clamp-2 flex-1">
        {cat.description}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between mt-5 pt-4 border-t"
        style={{ borderColor: '#F1F5F9' }}
      >
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: cat.badgeBg, color: cat.badgeColor }}
        >
          {cat.count} articles
        </span>
        <span
          className="text-sm font-medium flex items-center gap-1 transition-colors duration-200"
          style={{ color: hovered ? cat.accentBorder : '#2563EB' }}
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

const CategoryCardsGrid = ({ onCategorySelect }) => {
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
    <section ref={sectionRef} className="bg-white py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center">
          <h2
            className="text-[#0F172A] font-bold text-[28px]"
            style={{
              opacity: isVisible ? 1 : 0,
              animation: isVisible ? 'hc-fade-up 0.5s ease-out 0s both' : 'none',
            }}
          >
            Browse by Topic
          </h2>
          <p
            className="text-[#475569] text-[15px] mt-2"
            style={{
              opacity: isVisible ? 1 : 0,
              animation: isVisible ? 'hc-fade-up 0.5s ease-out 0.1s both' : 'none',
            }}
          >
            Find answers organized by category
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 mt-10">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={i}
              isVisible={isVisible}
              onSelect={onCategorySelect}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hc-card-rise {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hc-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default CategoryCardsGrid;
