import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, Info, Loader2, ArrowDown, BadgeCheck, ArrowLeft, MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

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

  const otherParticipant = conversation?.otherParticipant;
  const otherName = otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Researcher';
  const otherImage = otherParticipant?.profileImage;

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto scroll on new messages
  useEffect(() => {
    scrollToBottom('auto');
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
      {/* Chat Header - Improved */}
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

          <div className="relative flex-shrink-0">
            <img
              src={otherImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
              alt={otherName}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white shadow"
            />
            {otherParticipant?.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-slate-900 truncate">{otherName}</h4>
              {!conversation.isGroup && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />}
            </div>
            <p className="text-xs text-slate-500 truncate">
              {otherParticipant?.designation ? `${otherParticipant.designation} • ` : ''}
              {otherParticipant?.institution || (otherParticipant?.isOnline ? 'Online now' : 'Offline')}
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
            className={`p-3 rounded-2xl transition-all ${showInfoPanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Overview"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area - Optimized Scroll */}
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-slate-50 flex flex-col gap-5 scroll-smooth"
      >
        <div className="flex justify-center my-2">
          <span className="px-5 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-500 rounded-full shadow-sm">
            Today
          </span>
        </div>

        {messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg._id} className="flex justify-center my-3">
                <div className="bg-white border border-slate-100 px-6 py-3 rounded-3xl text-center max-w-xs shadow-sm">
                  <p className="text-sm text-slate-600">🤝 {msg.text}</p>
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
              otherParticipant={otherParticipant}
            />
          );
        })}

        {partnerTyping && (
          <div className="self-start pl-3">
            <TypingIndicator name={otherParticipant?.firstName || 'Researcher'} />
          </div>
        )}

        <div ref={messagesEndRef} className="h-6" />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollDown && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-28 right-6 p-3 bg-white border border-slate-200 text-blue-600 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all z-30"
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
