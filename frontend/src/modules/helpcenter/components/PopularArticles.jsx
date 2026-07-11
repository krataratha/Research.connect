import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ARTICLES, TABS } from '../data/helpCenterData';

// ─── Article → real app route ────────────────────────────────────────────────
const ARTICLE_ROUTES = {
  'upload-first-paper': '/publications/create',
  'format-and-metadata': '/publications/create',
  'institutional-verification': '/research-identity',
  'invite-coauthors': '/collaborations',
  'orcid-account': '/research-identity',
  'research-feed': '/feed',
  'create-workspace': '/collaborations',
  'notification-preferences': '/notifications',
};

// ─── Single Accordion Item ───────────────────────────────────────────────────
const AccordionItem = ({ article, isOpen, onToggle, highlighted, onHighlightDone }) => {
  const navigate = useNavigate();
  const [thumbUp, setThumbUp] = useState(false);
  const [thumbDown, setThumbDown] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (highlighted) {
      setIsFlashing(true);
      const t = setTimeout(() => {
        setIsFlashing(false);
        onHighlightDone?.();
      }, 700);
      return () => clearTimeout(t);
    }
  }, [highlighted]);

  const handleThumbUp = () => {
    setThumbUp(true);
    setThumbDown(false);
    setShowFeedbackInput(false);
    setShowThankYou(true);
    window.dispatchEvent(new CustomEvent('hc-toast', { detail: { message: 'Thanks for your feedback!' } }));
    setTimeout(() => setShowThankYou(false), 2000);
  };

  const handleThumbDown = () => {
    setThumbDown(true);
    setThumbUp(false);
    setShowFeedbackInput(true);
  };

  const handleSendFeedback = () => {
    setShowFeedbackInput(false);
    setFeedbackText('');
    window.dispatchEvent(new CustomEvent('hc-toast', { detail: { message: "Feedback sent! We'll look into it." } }));
  };

  const handleGoToPage = (e) => {
    e.stopPropagation();
    navigate(ARTICLE_ROUTES[article.id] || '/help');
  };

  return (
    <div
      id={`article-${article.id}`}
      className="border-b border-[#F1F5F9] last:border-b-0"
      style={{
        background: isFlashing ? '#DBEAFE' : 'transparent',
        transition: 'background 0.4s ease',
      }}
    >
      {/* ── Header: click = expand/collapse ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between py-4 text-left group cursor-pointer"
      >
        <div className="flex-1 pr-3 min-w-0">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2"
            style={{ background: article.categoryBg, color: article.categoryColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: article.categoryColor }} />
            {article.category}
          </span>
          <p className="text-[#0F172A] font-medium text-[15px] leading-snug group-hover:text-[#2563EB] transition-colors duration-150">
            {article.title}
          </p>
        </div>
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 mt-1 transition-transform duration-250"
          style={{ color: '#94A3B8', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* ── Body ── */}
      <div
        className="overflow-hidden"
        style={{
          maxHeight: isOpen ? '600px' : '0',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.35s ease-out, opacity 0.25s ease-out',
        }}
      >
        <div className="pb-5">
          <p className="text-[#475569] text-sm leading-relaxed">{article.description}</p>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <button
              onClick={handleGoToPage}
              className="inline-flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
            >
              Go to page <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <span className="text-[#E2E8F0] select-none">|</span>
            <span className="text-[#475569] text-sm">Helpful?</span>

            <div className="flex items-center gap-1 relative">
              <button onClick={handleThumbUp} className="p-1.5 rounded-lg hover:bg-[#F0FDF4] transition-colors" title="Yes">
                <ThumbsUp className="w-4 h-4 transition-colors duration-200" style={{ color: thumbUp ? '#22C55E' : '#94A3B8' }} fill={thumbUp ? '#22C55E' : 'none'} />
              </button>
              <button onClick={handleThumbDown} className="p-1.5 rounded-lg hover:bg-[#FFF1F2] transition-colors" title="No">
                <ThumbsDown className="w-4 h-4 transition-colors duration-200" style={{ color: thumbDown ? '#EF4444' : '#94A3B8' }} fill={thumbDown ? '#EF4444' : 'none'} />
              </button>
              {showThankYou && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10" style={{ animation: 'hc-fade-in 0.2s ease-out both' }}>
                  Thank you!
                </span>
              )}
            </div>
          </div>

          <div style={{ maxHeight: showFeedbackInput ? '120px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease-out, opacity 0.2s ease-out', opacity: showFeedbackInput ? 1 : 0 }}>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="How can we improve this?"
                className="flex-1 border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
              <button onClick={handleSendFeedback} className="text-white text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hc-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

// ─── Popular Articles Section ────────────────────────────────────────────────
const PopularArticles = ({
  activeArticleId,
  onArticleHighlighted,
  forcedTab,
  onForcedTabConsumed,
}) => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState('All Topics');
  const [tabChanging, setTabChanging] = useState(false);
  const sectionRef = useRef(null);

  // When a category card sets a forcedTab, apply it once
  useEffect(() => {
    if (forcedTab) {
      setTabChanging(true);
      setTimeout(() => {
        setActiveTab(forcedTab);
        setOpenId(null);
        setTabChanging(false);
        onForcedTabConsumed?.();
      }, 150);
    }
  }, [forcedTab]);

  // Auto-open highlighted article from search
  useEffect(() => {
    if (activeArticleId) {
      setOpenId(activeArticleId);
      const el = document.getElementById(`article-${activeArticleId}`);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [activeArticleId]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setTabChanging(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTabChanging(false);
      setOpenId(null);
    }, 150);
  };

  const filteredArticles =
    activeTab === 'All Topics'
      ? ARTICLES
      : ARTICLES.filter((a) => {
          if (activeTab === 'Getting Started') return a.category === 'Getting Started';
          if (activeTab === 'Publishing') return a.category === 'Publishing';
          if (activeTab === 'Account') return a.category === 'Account';
          if (activeTab === 'Collaboration') return a.category === 'Collaboration';
          return true;
        });

  return (
    <div
      ref={sectionRef}
      className="bg-white border border-[#E2E8F0] rounded-2xl p-6"
      style={{ animation: 'hc-slide-right 0.5s ease-out both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#0F172A] font-bold text-xl">
          {activeTab === 'All Topics' ? 'Popular Articles' : `${activeTab} Articles`}
        </h2>
        {activeTab !== 'All Topics' && (
          <button
            onClick={() => handleTabChange('All Topics')}
            className="text-[#475569] text-sm hover:text-[#2563EB] transition-colors"
          >
            ← All topics
          </button>
        )}
      </div>

      {/* Tab pills */}
      <div className="flex gap-2 mt-4 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className="text-sm px-4 py-1.5 rounded-full border font-medium transition-all duration-200"
            style={
              activeTab === tab
                ? { background: '#2563EB', color: '#fff', borderColor: '#2563EB' }
                : { background: '#fff', color: '#475569', borderColor: '#E2E8F0' }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Articles list */}
      <div style={{ opacity: tabChanging ? 0 : 1, transition: 'opacity 0.15s ease' }}>
        {filteredArticles.length === 0 ? (
          <p className="text-[#475569] text-sm py-8 text-center">No articles in this category.</p>
        ) : (
          filteredArticles.map((article) => (
            <AccordionItem
              key={article.id}
              article={article}
              isOpen={openId === article.id}
              onToggle={() => setOpenId(openId === article.id ? null : article.id)}
              highlighted={activeArticleId === article.id}
              onHighlightDone={onArticleHighlighted}
            />
          ))
        )}
      </div>

      <style>{`
        @keyframes hc-slide-right {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default PopularArticles;
