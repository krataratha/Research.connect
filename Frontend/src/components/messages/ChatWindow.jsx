import { useRef, useEffect, useLayoutEffect } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { MessageSkeleton } from './Skeletons';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { FlaskConical, BookOpen } from 'lucide-react';

export default function ChatWindow() {
  const {
    activeConversationId,
    messages,
    messagesMeta,
    loadMoreMessages,
    typingUsers,
    getOtherParticipant,
    searchQuery
  } = useMessaging();

  const containerRef = useRef(null);
  const sentinelRef = useRef(null);
  const bottomRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const isFirstLoadRef = useRef(true);
  const prevConvIdRef = useRef(null);

  const meta = messagesMeta.get(activeConversationId);
  let currentMessages = messages.get(activeConversationId) || [];
  
  if (searchQuery.trim()) {
    currentMessages = currentMessages.filter(m => 
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const otherParticipant = getOtherParticipant(activeConversationId);
  const isTyping = typingUsers.get(activeConversationId)?.size > 0;

  // Jab bhi dusri chat khole, scroll reset karne ka logic
  useEffect(() => {
    if (activeConversationId !== prevConvIdRef.current) {
      isFirstLoadRef.current = true;
      prevConvIdRef.current = activeConversationId;
    }
  }, [activeConversationId]);

  // Purane messages load karne ke liye observer (Infinite Scroll)
  useEffect(() => {
    if (!sentinelRef.current || !activeConversationId || !meta?.hasMore || meta?.isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Naye messages laane se pehle current scroll height save kar lo
          if (containerRef.current) {
            previousScrollHeightRef.current = containerRef.current.scrollHeight;
          }
          loadMoreMessages(activeConversationId);
        }
      },
      { root: containerRef.current, threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [activeConversationId, meta, loadMoreMessages]);

  // Purane messages aane pe scroll wahi roko, ya naye message/first load pe bottom pe jao
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    if (meta?.isLoading) {
      // Data load ho raha hai, abhi kuch mat karo
      return;
    }

    if (isFirstLoadRef.current && currentMessages.length > 0) {
      // Pehli baar khulne par seedha neeche (bottom) scroll karo
      bottomRef.current?.scrollIntoView();
      isFirstLoadRef.current = false;
    } else if (meta?.isLoadingMore === false && previousScrollHeightRef.current > 0) {
      // Purane messages load ho chuke, ab scroll adjust kar do taaki jump na ho
      const newScrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop += (newScrollHeight - previousScrollHeightRef.current);
      previousScrollHeightRef.current = 0; // Reset kar do
    } else if (previousScrollHeightRef.current === 0 && !meta?.isLoadingMore) {
      // Ek naya message aaya hai, seedha neeche bhej do
      // (Asli tareeka scroll event track karna hai, par abhi simple scroll to bottom use kar rahe hain)
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [currentMessages, meta?.isLoading, meta?.isLoadingMore]);


  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center anim-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 anim-breathe">
            <BookOpen size={28} className="text-white" />
          </div>
          <p className="font-semibold text-[#0F172A] text-base">Select a conversation</p>
          <p className="text-sm text-[#94A3B8] mt-1">Choose from the list to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAFC]">
      <div ref={containerRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">

        {/* Scroll Sentinel (Isse pata chalta hai ki upar pohoch gaye) */}
        <div ref={sentinelRef} className="h-1 w-full" />

        {meta?.isLoadingMore && (
          <div className="flex justify-center py-2">
            <span className="text-xs text-[#94A3B8] font-medium">Loading older messages...</span>
          </div>
        )}

        {meta?.isLoading ? (
          <MessageSkeleton />
        ) : (
          <>
            {/* Date Separator (Aaj ka din) */}
            <div className="flex items-center gap-4 py-2 anim-date-line" style={{ animationDelay: '200ms' }}>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#CBD5E1] to-transparent" />
              <span className="text-[10px] font-bold text-[#94A3B8] tracking-[0.15em] uppercase bg-[#F1F5F9] px-3 py-1 rounded-full border border-[#E2E8F0]">Today</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#CBD5E1] to-transparent" />
            </div>

            {currentMessages.length === 0 && searchQuery.trim() ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#64748B]">
                <p className="text-sm">No messages found matching "{searchQuery}"</p>
              </div>
            ) : (
              currentMessages.map((msg, i) => (
                <MessageBubble
                  key={msg.tempId || msg.id}
                  message={msg}
                  animDelay={Math.min(300 + (i * 50), 800)}
                />
              ))
            )}
          </>
        )}

        {isTyping && otherParticipant && (
          <TypingIndicator avatarUrl={otherParticipant.avatarUrl} name={otherParticipant.fullName} />
        )}

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Quick Actions (Neeche wale buttons) */}
      <div className="flex gap-3 px-6 py-2.5 bg-white border-t border-[#E8EDF5] shrink-0">
        <button
          className="link-dataset-btn anim-link-btn flex items-center gap-2 text-[#64748B] hover:text-[#2563EB] text-xs font-semibold hover:bg-[#EEF2FF] px-3 py-1.5 rounded-lg transition-all duration-200 group"
          style={{ animationDelay: '700ms' }}
        >
          <FlaskConical size={14} className="link-dataset-icon group-hover:scale-110 transition-transform" />
          Link Dataset
        </button>
        <button
          className="cite-pub-btn anim-link-btn flex items-center gap-2 text-[#64748B] hover:text-[#4F46E5] text-xs font-semibold hover:bg-[#EDE9FE] px-3 py-1.5 rounded-lg transition-all duration-200 group"
          style={{ animationDelay: '780ms' }}
        >
          <BookOpen size={14} className="cite-pub-icon group-hover:scale-110 transition-transform" />
          Cite Publication
        </button>
      </div>
    </div>
  );
}
