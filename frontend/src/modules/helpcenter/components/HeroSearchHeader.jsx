import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { POPULAR_SEARCHES, ARTICLES } from '../data/helpCenterData';

const STATS = [
  { number: '500+', label: 'Help Articles' },
  { number: '< 2min', label: 'Avg Resolution' },
  { number: '98%', label: 'Satisfaction Rate' },
];

const HeroSearchHeader = ({ onSearchSelect, searchQuery, setSearchQuery, searchRef }) => {
  const [focused, setFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  // Stats stagger animation
  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  // Debounced search filter
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const results = ARTICLES.filter(
          (a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
        );
        setFilteredArticles(results);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
        setFilteredArticles([]);
      }
    }, 400);
    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside closes dropdown
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChipClick = (chip) => {
    setSearchQuery(chip);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setShowDropdown(false);
  };

  const handleResultClick = (article) => {
    setShowDropdown(false);
    setSearchQuery(article.title);
    onSearchSelect && onSearchSelect(article.id);
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
        paddingTop: '64px',
        paddingBottom: '56px',
        paddingLeft: '32px',
        paddingRight: '32px',
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full pointer-events-none"
        style={{
          transform: 'translate(-50%, -50%)',
          animation: 'hc-blob-move 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full pointer-events-none"
        style={{
          transform: 'translate(50%, 50%)',
          animation: 'hc-blob-move 12s ease-in-out infinite reverse',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* Eyebrow */}
        <span
          className="text-white/60 tracking-widest text-xs font-semibold uppercase"
          style={{ animation: 'hc-fade-in 0.4s ease-out 0.2s both' }}
        >
          HELP CENTER
        </span>

        {/* Heading */}
        <h1
          className="text-white font-bold text-4xl md:text-5xl mt-3 leading-tight"
          style={{ animation: 'hc-fade-up 0.5s ease-out 0.3s both' }}
        >
          How can we help you?
        </h1>

        {/* Subtitle */}
        <p
          className="text-white/75 text-base mt-4 max-w-md"
          style={{ animation: 'hc-fade-up 0.5s ease-out 0.4s both' }}
        >
          Search our knowledge base, explore guides, or chat with our AI assistant.
        </p>

        {/* Search Bar */}
        <div
          ref={containerRef}
          className="relative mt-8 w-full max-w-xl"
          style={{ animation: 'hc-fade-up 0.5s ease-out 0.5s both' }}
        >
          <div
            className="flex flex-row items-center bg-white rounded-2xl p-2 transition-all duration-300"
            style={{
              boxShadow: focused
                ? '0 8px 40px rgba(0,0,0,0.25), 0 0 0 12px rgba(37,99,235,0.1)'
                : '0 8px 40px rgba(0,0,0,0.25)',
            }}
          >
            <Search className="ml-3 w-5 h-5 flex-shrink-0" style={{ color: '#94A3B8' }} />
            <input
              ref={searchRef}
              id="help-center-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Search articles, guides, topics..."
              className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-[#0F172A] text-base px-3 py-3 placeholder:text-[#94A3B8]"
            />
            <button
              className="flex-shrink-0 text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
              }}
            >
              Search
            </button>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-h-80 overflow-y-auto z-50"
              style={{ animation: 'hc-scale-in 0.2s ease-out forwards', transformOrigin: 'top' }}
            >
              <p className="px-4 pt-3 pb-2 text-xs uppercase tracking-wider text-[#94A3B8] font-semibold">
                Suggested Articles
              </p>
              {filteredArticles.length === 0 ? (
                <p className="px-4 py-3 text-sm text-[#475569]">No articles found.</p>
              ) : (
                filteredArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => handleResultClick(article)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors text-left"
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: '#94A3B8' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="flex-1 text-sm text-[#0F172A]">{article.title}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: article.categoryBg,
                        color: article.categoryColor,
                      }}
                    >
                      {article.category}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Popular search chips */}
        <div
          className="mt-5 flex flex-wrap justify-center gap-2 items-center"
          style={{ animation: 'hc-fade-up 0.5s ease-out 0.6s both' }}
        >
          <span className="text-white/50 text-xs">Popular:</span>
          {POPULAR_SEARCHES.map((chip, i) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="bg-white/15 border border-white/25 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/30 transition-all duration-200"
              style={{ animation: `hc-fade-in 0.3s ease-out ${0.65 + i * 0.06}s both` }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 flex justify-center gap-8 flex-wrap">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center"
              style={{
                animation: statsVisible
                  ? `hc-fade-up 0.5s ease-out ${i * 0.1}s both`
                  : 'none',
                opacity: statsVisible ? undefined : 0,
              }}
            >
              <span className="text-white font-black text-3xl leading-tight">{stat.number}</span>
              <span className="text-white/60 text-xs font-medium mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inline keyframes for hero section only */}
      <style>{`
        @keyframes hc-blob-move {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes hc-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hc-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hc-scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
};

export default HeroSearchHeader;
