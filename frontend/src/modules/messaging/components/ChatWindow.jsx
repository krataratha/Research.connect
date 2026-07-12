import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, Info, User, Loader2, ArrowDown, Shield, MoreVertical } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

const formatLastSeen = (lastSeenDate) => {
  if (!lastSeenDate) return 'Offline';
  const date = new Date(lastSeenDate);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `Offline • Last seen today at ${formattedHours}:${minutes} ${ampm}`;
  } else if (diffDays === 1) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `Offline • Last seen yesterday at ${formattedHours}:${minutes} ${ampm}`;
  } else if (diffDays < 7) {
    return `Offline • Last seen ${diffDays} days ago`;
  } else {
    return `Offline • Last seen on ${date.toLocaleDateString()}`;
  }
};

const ChatWindow = ({ 
  conversation, 
  messages = [], 
  isLoading, 
  onSendMessage, 
  onStartCall, 
  socket,
  showInfoPanel,
  setShowInfoPanel
}) => {
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
      <div className="flex-1 h-full bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 h-full bg-slate-50/50 flex flex-col items-center justify-center space-y-3.5 text-slate-400 select-none">
        <div className="w-16 h-16 bg-blue-50/80 rounded-3xl flex items-center justify-center border border-blue-100 shadow-sm">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-black text-slate-800 tracking-tight">Your Research Chats</p>
          <p className="text-xs text-slate-450 font-bold max-w-xs leading-relaxed">
            Select a contact or collaboration request to start exchanging insights and publications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-slate-50/30 flex flex-col min-w-0 relative">
      {/* Chat header */}
      <div className="px-5 py-3 bg-white border-b border-slate-200 flex justify-between items-center z-15 shadow-sm select-none text-left">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <img
              src={otherImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
              alt={otherName}
              className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm"
            />
            {otherParticipant?.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>
          <div className="space-y-0.5 min-w-0 text-left">
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-black text-slate-900 truncate leading-tight">
                {otherName}
              </h4>
              {!conversation.isGroup && <Shield className="w-3.5 h-3.5 text-blue-600 fill-blue-600" title="Verified Researcher" />}
            </div>
            <p className="text-[10px] font-bold text-slate-400 truncate max-w-md flex items-center gap-1.5">
              <span>{otherParticipant?.designation ? `${otherParticipant.designation} at ` : ''}</span>
              <span>{otherParticipant?.institution || ''}</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${otherParticipant?.isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                {otherParticipant?.isOnline ? '🟢 Online' : formatLastSeen(otherParticipant?.lastSeen)}
              </span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={() => onStartCall('voice')}
            className="p-2 rounded-xl hover:bg-slate-50 hover:scale-105 active:scale-95 text-slate-500 hover:text-slate-800 transition-all cursor-pointer border border-slate-200/50 shadow-xs" 
            title="Voice Call"
          >
            <Phone className="w-4 h-4 text-slate-650" />
          </button>
          <button 
            onClick={() => onStartCall('video')}
            className="p-2 rounded-xl hover:bg-slate-50 hover:scale-105 active:scale-95 text-slate-500 hover:text-slate-800 transition-all cursor-pointer border border-slate-200/50 shadow-xs" 
            title="Video Call"
          >
            <Video className="w-4 h-4 text-slate-650" />
          </button>
          <button 
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`p-2 rounded-xl hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-200/50 shadow-xs ${showInfoPanel ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-500 hover:text-slate-800'}`}
            title="More Info"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={viewportRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 flex flex-col gap-4.5 bg-slate-50/20"
      >
        {/* Date / Welcome separator */}
        <div className="flex items-center justify-center my-2.5">
          <span className="px-3.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-extrabold text-slate-450 shadow-xs select-none">
            Today
          </span>
        </div>

        {messages.map((msg) => {
          // If message is a system type
          if (msg.type === 'system') {
            return (
              <div key={msg._id} className="flex items-center justify-center my-3 select-none">
                <div className="bg-slate-100/80 border border-slate-200/50 px-4 py-2.5 rounded-2xl max-w-md text-center shadow-xs">
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                    🤝 {msg.text}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <MessageBubble
              key={msg._id}
              message={msg}
              onReply={() => setReplyContext(msg)}
              onEditInit={() => setEditContext(msg)}
            />
          );
        })}

        {/* Partner Typing indicator bubble */}
        {partnerTyping && (
          <div className="self-start pl-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <TypingIndicator name={otherParticipant?.firstName || 'Researcher'} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll Down button */}
      {showScrollDown && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-24 right-6 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all z-20 cursor-pointer animate-bounce border border-blue-500"
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
