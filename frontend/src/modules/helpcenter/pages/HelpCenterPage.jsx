import React, { useState, useRef, useEffect, useCallback } from 'react';
import HeroSearchHeader from '../components/HeroSearchHeader';
import CategoryCardsGrid from '../components/CategoryCardsGrid';
import PopularArticles from '../components/PopularArticles';
import QuickActionsPanel from '../components/QuickActionsPanel';
import VideoTutorialsRow from '../components/VideoTutorialsRow';
import ContactOptionsGrid from '../components/ContactOptionsGrid';
import FooterCtaBanner from '../components/FooterCtaBanner';
import FloatingChatbot from '../components/FloatingChatbot';
import SuccessToast from '../components/SuccessToast';

const HelpCenterPage = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticleId, setActiveArticleId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null); // tab label e.g. "Getting Started"
  const [toasts, setToasts] = useState([]);
  const searchRef = useRef(null);
  const articlesSectionRef = useRef(null);

  // Listen for custom toast events
  useEffect(() => {
    const handler = (e) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message: e.detail.message }]);
    };
    window.addEventListener('hc-toast', handler);
    return () => window.removeEventListener('hc-toast', handler);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Called when a search result is selected
  const handleSearchSelect = (articleId) => {
    setActiveArticleId(articleId);
    const el = document.getElementById(`article-${articleId}`);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  };

  const handleArticleHighlighted = () => {
    setActiveArticleId(null);
  };

  // Called when a category card is clicked
  const handleCategorySelect = (tabLabel) => {
    setActiveCategory(tabLabel);
    // Scroll to the articles section smoothly
    if (articlesSectionRef.current) {
      setTimeout(() => {
        articlesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const handleCategoryConsumed = () => {
    setActiveCategory(null);
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: '#F8FAFC' }}>
      {/* Section 1 — Hero */}
      <HeroSearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchRef={searchRef}
        onSearchSelect={handleSearchSelect}
      />

      {/* Section 2 — Category Cards */}
      <CategoryCardsGrid onCategorySelect={handleCategorySelect} />

      {/* Section 3 — Popular Articles + Quick Actions */}
      <section ref={articlesSectionRef} className="bg-[#F8FAFC] py-16 px-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          <PopularArticles
            activeArticleId={activeArticleId}
            onArticleHighlighted={handleArticleHighlighted}
            forcedTab={activeCategory}
            onForcedTabConsumed={handleCategoryConsumed}
          />
          <QuickActionsPanel onOpenChat={() => setChatOpen(true)} />
        </div>
      </section>

      {/* Section 4 — Video Tutorials */}
      <VideoTutorialsRow />

      {/* Section 5 — Contact Options */}
      <ContactOptionsGrid onOpenChat={() => setChatOpen(true)} />

      {/* Section 6 — Footer CTA */}
      <FooterCtaBanner onOpenChat={() => setChatOpen(true)} />

      {/* Floating Chatbot */}
      <FloatingChatbot
        isOpen={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
      />

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <SuccessToast
            key={toast.id}
            message={toast.message}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default HelpCenterPage;
