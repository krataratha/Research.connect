import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Minus, SendHorizontal, Paperclip } from 'lucide-react';
import { BOT_RESPONSES, QUICK_REPLY_CHIPS } from '../data/helpCenterData';

let msgIdCounter = 0;
const newId = () => ++msgIdCounter;

const getBotResponse = (text) => {
  const t = text.toLowerCase();
  if (t.includes('upload') || t.includes('paper')) return BOT_RESPONSES.upload;
  if (t.includes('account') || t.includes('profile') || t.includes('setting')) return BOT_RESPONSES.account;
  if (t.includes('password') || t.includes('login') || t.includes('sign in')) return BOT_RESPONSES.password;
  return BOT_RESPONSES.fallback;
};

const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-1">
    {/* Bot avatar */}
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
      style={{ background: '#DBEAFE', color: '#2563EB' }}
    >
      AI
    </div>
    <div
      className="px-4 py-3 flex items-center gap-1"
      style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '4px 18px 18px 18px',
      }}
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="block w-1.5 h-1.5 rounded-full"
          style={{
            background: '#94A3B8',
            animation: `hc-typing-dot 1s ease-in-out ${delay}ms infinite`,
          }}
        />
      ))}
    </div>
  </div>
);

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div
      className={`flex items-end gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ animation: 'hc-chat-bubble-in 0.3s ease-out both' }}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
          style={{ background: '#DBEAFE', color: '#2563EB' }}
        >
          AI
        </div>
      )}
      <div
        className="px-4 py-3 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap"
        style={
          isUser
            ? {
              background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
              color: '#fff',
              borderRadius: '18px 18px 4px 18px',
              maxWidth: '80%',
            }
            : {
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              borderRadius: '4px 18px 18px 18px',
            }
        }
      >
        {msg.text}
      </div>
    </div>
  );
};

const FloatingChatbot = ({ isOpen, onOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: newId(),
      role: 'bot',
      text: "👋 Hi! I'm the ResearchConnect AI assistant. I can help you with publishing papers, citations, account settings, and more. What do you need help with today?",
    },
  ]);
  const [chips, setChips] = useState(QUICK_REPLY_CHIPS);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [waveDone, setWaveDone] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Wave animation once on mount
  useEffect(() => {
    const t = setTimeout(() => setWaveDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Hide badge when opened
  useEffect(() => {
    if (isOpen) setShowBadge(false);
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;
      const userMsg = { id: newId(), role: 'user', text: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const botText = getBotResponse(text);
        setMessages((prev) => [...prev, { id: newId(), role: 'bot', text: botText }]);
      }, 1200);
    },
    []
  );

  const handleChipClick = (chip) => {
    setChips((prev) => prev.filter((c) => c !== chip));
    sendMessage(chip);
  };

  const handleSend = () => sendMessage(inputText);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaperclip = () => {
    // Show a simple toast via custom event
    const event = new CustomEvent('hc-toast', {
      detail: { message: 'File attachment coming soon!' },
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      {/* Pulse ring behind button */}
      <div
        className="fixed bottom-6 right-6 z-40 w-[60px] h-[60px] rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.4), rgba(79,70,229,0.4))',
          animation: 'hc-pulse-ring 2s ease-out infinite',
        }}
      />

      {/* Floating button */}
      <button
        id="chatbot-toggle-btn"
        onClick={isOpen ? onClose : onOpen}
        className="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-2xl transition-transform duration-150 active:scale-90"
        style={{
          background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
          animation: waveDone ? 'none' : 'hc-bot-wave 0.6s ease-in-out',
        }}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Unread badge */}
      {showBadge && !isOpen && (
        <div
          className="fixed bottom-[72px] right-4 z-50 w-[18px] h-[18px] rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center pointer-events-none"
          style={{ animation: 'hc-badge-pop 0.4s cubic-bezier(0.34,1.2,0.64,1) both' }}
        >
          3
        </div>
      )}

      {/* Chat window */}
      <div
        className="fixed bottom-24 right-6 z-50 w-[380px] flex flex-col bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden"
        style={{
          height: '520px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          transformOrigin: 'bottom right',
          animation: isOpen
            ? 'hc-chat-open 0.35s cubic-bezier(0.34,1.2,0.64,1) forwards'
            : 'hc-chat-close 0.25s ease-in forwards',
          pointerEvents: isOpen ? 'all' : 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center px-4 py-3 flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
            minHeight: '56px',
          }}
        >
          {/* Bot avatar */}
          <div className="relative mr-3 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-xs font-bold"
              style={{ color: '#2563EB' }}
            >
              RC
            </div>
            <span className="absolute bottom-0 right-0 block w-2 h-2 rounded-full bg-[#22C55E] border border-white" />
          </div>
          {/* Name */}
          <div className="flex-1">
            <p className="text-white font-semibold text-sm leading-tight">ResearchConnect AI</p>
            <p className="text-white/60 text-xs">Always online</p>
          </div>
          {/* Controls */}
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1 ml-1"
            aria-label="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1 ml-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Quick reply chips after welcome */}
          {chips.length > 0 && messages.length === 1 && !isTyping && (
            <div className="flex flex-col gap-2 mt-2 pl-9">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="text-xs px-3 py-2 rounded-full w-fit text-left transition-all duration-200 hover:bg-[#DBEAFE]"
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#2563EB',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          className="flex items-center gap-2 px-3 py-3 border-t border-[#E2E8F0] flex-shrink-0"
        >
          <button
            onClick={handlePaperclip}
            className="text-[#94A3B8] hover:text-[#2563EB] transition-colors duration-150 p-1 flex-shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] outline-none transition-all duration-150"
            style={{
              '--tw-ring-color': '#2563EB',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563EB';
              e.target.style.boxShadow = '0 0 0 1px #2563EB';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E2E8F0';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-90"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
              opacity: inputText.trim() ? 1 : 0.4,
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            }}
            aria-label="Send message"
          >
            <SendHorizontal className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes hc-bot-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        @keyframes hc-badge-pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes hc-pulse-ring {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes hc-chat-open {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes hc-chat-close {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.8) translateY(20px); }
        }
        @keyframes hc-chat-bubble-in {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hc-typing-dot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default FloatingChatbot;
