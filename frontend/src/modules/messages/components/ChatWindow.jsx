import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, Info, User, Loader2, ArrowDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({ conversation, messages = [], isLoading, onSendMessage, socket }) => {
  const [replyContext, setReplyContext] = useState(null);
  const [editContext, setEditContext] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef(null);
  const viewportRef = useRef(null);

  const otherParticipant = conversation?.otherParticipant;
  const otherName = otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Researcher';
  const otherImage = otherParticipant?.profileImage;

  // Scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom on load or new message
  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length]);

  // Handle typing indicator signals from global socket events
  useEffect(() => {
    if (!conversation || !otherParticipant) return;

    const handleTypingStart = (e) => {
      if (
        e.detail.conversationId === conversation._id &&
        e.detail.userId === otherParticipant._id
      ) {
        setPartnerTyping(true);
        scrollToBottom();
      }
    };

    const handleTypingStop = (e) => {
      if (
        e.detail.conversationId === conversation._id &&
        e.detail.userId === otherParticipant._id
      ) {
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

  // Monitor scroll height to show floating scroll-down button
  const handleScroll = () => {
    if (!viewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollDown(!isNearBottom);
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

  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 h-full bg-slate-50 flex flex-col items-center justify-center space-y-2 text-slate-400">
        <Loader2 className="w-10 h-10 opacity-30 animate-pulse" />
        <p className="text-xs font-black uppercase tracking-wider">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-slate-50 flex flex-col min-w-0 relative">
      {/* Chat header */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex justify-between items-center z-10 shadow-xs select-none text-left">
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={otherImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
            alt={otherName}
            className="w-10 h-10 rounded-full object-cover border border-slate-100"
          />
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-xs font-black text-slate-900 truncate leading-tight">
              {otherName}
            </h4>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${otherParticipant?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {otherParticipant?.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Future capabilities placeholder actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button className="p-2 rounded-lg hover:bg-slate-150 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" title="Voice Call (Future)">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-150 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" title="Video Call (Future)">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-150 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" title="More Info">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={viewportRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 relative"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            onReply={() => setReplyContext(msg)}
            onEditInit={() => setEditContext(msg)}
          />
        ))}

        {/* Partner Typing indicator bubble */}
        {partnerTyping && (
          <div className="self-start">
            <TypingIndicator name={otherParticipant?.firstName || 'Researcher'} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll Down button */}
      {showScrollDown && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-20 right-6 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all z-20 cursor-pointer animate-bounce"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input controls */}
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
