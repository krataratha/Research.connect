import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, Video, Info, Loader2, ArrowDown, BadgeCheck, ArrowLeft, MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import Avatar from '../../../components/ui/Avatar';
import { formatLastSeen, getGroupDateString } from '../../../utils/date';
import { usePresence } from '../../../context/PresenceContext';

// Custom Intersection Observer Hook for Virtualization
const useIntersectionObserver = ({ root = null, rootMargin = '0px', threshold = 0 } = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { root, rootMargin, threshold }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [target, root, rootMargin, threshold]);

  return [setTarget, isIntersecting];
};

// Virtualized Message Bubble Wrapper (Requirement 16)
const VirtualMessage = ({ children, id, estimatedHeight = 80 }) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    rootMargin: '400px 0px', // Load before entering viewport
  });
  const [height, setHeight] = useState(estimatedHeight);
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current && isIntersecting) {
      const measured = elementRef.current.getBoundingClientRect().height;
      if (measured > 0) {
        setHeight(measured);
      }
    }
  }, [isIntersecting]);

  const setRefs = useCallback((node) => {
    elementRef.current = node;
    ref(node);
  }, [ref]);

  if (!isIntersecting) {
    return <div ref={setRefs} style={{ height: `${height}px` }} className="w-full" data-virtual-id={id} />;
  }

  return (
    <div ref={setRefs} className="w-full" data-virtual-id={id}>
      {children}
    </div>
  );
};

const ChatWindow = ({
  conversation,
  messages = [],
  isLoading,
  onSendMessage,
  onStartCall,
  socket,
  showInfoPanel,
  setShowInfoPanel,
  onBack
}) => {
  const [replyContext, setReplyContext] = useState(null);
  const [editContext, setEditContext] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef(null);
  const viewportRef = useRef(null);

  const { getUserPresence } = usePresence();
  const otherParticipant = conversation?.otherParticipant;
  const presence = getUserPresence(otherParticipant?._id || otherParticipant?.id);
  const isOnline = presence.isOnline;
  const lastSeen = presence.lastSeen;

  const otherName = otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Researcher';
  const otherImage = otherParticipant?.profileImage;

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto scroll on new messages (Requirement 7)
  useEffect(() => {
    scrollToBottom(messages.length > 0 ? 'smooth' : 'auto');
  }, [messages.length]);

  // Typing indicators
  useEffect(() => {
    if (!conversation || !otherParticipant) return;

    const handleTypingStart = (e) => {
      if (e.detail.conversationId === conversation._id && e.detail.userId === otherParticipant._id) {
        setPartnerTyping(true);
        scrollToBottom();
      }
    };

    const handleTypingStop = (e) => {
      if (e.detail.conversationId === conversation._id && e.detail.userId === otherParticipant._id) {
        setPartnerTyping(false);
      }
    };

    window.addEventListener('typing:start', handleTypingStart);
    window.addEventListener('typing:stop', handleTypingStop);

    return () => {
      window.removeEventListener('typing:start', handleTypingStart);
      window.removeEventListener('typing:stop', handleTypingStop);
    };
  }, [conversation, otherParticipant]);

  const handleScroll = () => {
    if (!viewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight >= 180);
  };

  const handleSend = (payload) => {
    if (payload.action === 'edit') {
      onSendMessage({ action: 'edit', messageId: payload.messageId, text: payload.text });
      setEditContext(null);
    } else {
      onSendMessage({
        action: 'send',
        text: payload.text,
        type: payload.type,
        attachmentId: payload.attachmentId,
        replyTo: payload.replyTo
      });
      setReplyContext(null);
    }
  };

  // Spacing & Avatars processing (Requirement 5, 6, 14)
  const getSenderIdStr = (m) => {
    if (!m) return '';
    const s = m.senderId || m.sender;
    return typeof s === 'object' && s ? (s._id || s.id)?.toString() : s?.toString();
  };

  const processedItems = [];
  let lastDateStr = null;
  let lastSenderId = null;

  messages.forEach((msg, index) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    const showDateSeparator = msgDate !== lastDateStr;
    
    if (showDateSeparator) {
      lastDateStr = msgDate;
      processedItems.push({
        type: 'date_separator',
        key: `date-${msg._id || index}`,
        date: msg.createdAt
      });
    }

    const currentSenderId = getSenderIdStr(msg);
    // If it's a date separator or the sender changes, it's a different sender context
    const isDifferentSender = showDateSeparator || currentSenderId !== lastSenderId;
    lastSenderId = currentSenderId;

    processedItems.push({
      type: 'message',
      key: msg._id || `msg-${index}`,
      msg,
      isDifferentSender
    });
  });

  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 h-full bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center gap-4 text-slate-400 px-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-slate-800">Welcome to Research Chat</p>
          <p className="text-sm text-slate-500 max-w-xs">
            Select a conversation or start a new chat to collaborate with fellow researchers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-slate-50 flex flex-col min-w-0 relative">
      {/* Chat Header */}
      <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}

          <Avatar
            src={otherImage}
            name={otherName}
            size="lg"
            isOnline={isOnline}
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-slate-900 truncate">{otherName}</h4>
              {!conversation.isGroup && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />}
            </div>
            <p className="text-xs text-slate-500 truncate">
              {isOnline ? 'Online now' : formatLastSeen(lastSeen)}
              {(otherParticipant?.designation || otherParticipant?.institution) && (
                ` • ${otherParticipant?.designation || 'Researcher'}${otherParticipant?.institution ? ` at ${otherParticipant.institution}` : ''}`
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStartCall('voice')}
            className="p-3 hover:bg-slate-100 active:bg-slate-200 rounded-2xl transition-all text-slate-600 hover:text-slate-800"
            title="Voice Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => onStartCall('video')}
            className="p-3 hover:bg-slate-100 active:bg-slate-200 rounded-2xl transition-all text-slate-600 hover:text-slate-800"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`p-3 rounded-2xl transition-all ${showInfoPanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-650'}`}
            title="Overview"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area - Redesigned & Virtualized (Requirement 5, 16) */}
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-slate-50 flex flex-col gap-0 scroll-smooth"
      >
        {processedItems.map((item) => {
          if (item.type === 'date_separator') {
            return (
              <div key={item.key} className="flex justify-center my-3.5">
                <span className="px-4 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-500 rounded-full shadow-xs">
                  {getGroupDateString(item.date)}
                </span>
              </div>
            );
          }

          const { msg, isDifferentSender } = item;

          if (msg.type === 'system') {
            return (
              <div key={msg._id} className="flex justify-center my-3">
                <div className="bg-white border border-slate-100 px-6 py-3 rounded-3xl text-center max-w-xs shadow-sm">
                  <p className="text-sm text-slate-605">🤝 {msg.text || msg.message}</p>
                </div>
              </div>
            );
          }

          return (
            <VirtualMessage key={msg._id || item.key} id={msg._id || item.key}>
              <MessageBubble
                message={msg}
                onReply={() => setReplyContext(msg)}
                onEditInit={() => setEditContext(msg)}
                otherParticipant={otherParticipant}
                showAvatar={isDifferentSender}
                isDifferentSender={isDifferentSender}
              />
            </VirtualMessage>
          );
        })}

        {partnerTyping && (
          <div className="self-start pl-10 mt-2 animate-pulse">
            <TypingIndicator name={otherParticipant?.firstName || 'Researcher'} />
          </div>
        )}

        <div ref={messagesEndRef} className="h-6" />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollDown && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-28 right-6 p-3 bg-white border border-slate-200 text-blue-650 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all z-30 animate-bounce"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Message Input */}
      <MessageInput
        conversationId={conversation._id}
        onSend={handleSend}
        replyContext={replyContext}
        onClearReply={() => setReplyContext(null)}
        editContext={editContext}
        onClearEdit={() => setEditContext(null)}
        socket={socket}
      />
    </div>
  );
};

export default ChatWindow;
