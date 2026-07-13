import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchConversations,
  fetchMessages,
  createConversation,
  sendMessageToConversation,
  markConversationRead,
  setChatOpen,
  setActiveConversationId,
  toggleMeeting,
  setMeetingRoomId
} from '../../../redux/slices/messageSlice';
import {
  Send,
  X,
  Paperclip,
  FileText,
  Video,
  Sparkles,
  Loader2,
  PlusCircle,
  UserPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import feedService from '../../../services/feed.service';

const MessagesView = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const {
    conversations,
    messagesByConversation,
    activeConversationId,
    chatOpen,
    meetingActive,
    meetingRoomId,
    loading,
    sending
  } = useSelector((state) => state.message);

  const [text, setText] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [suggestedPeople, setSuggestedPeople] = useState([]);
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find((conversation) => (conversation._id || conversation.id) === activeConversationId) || conversations[0] || null;
  const activeMessages = activeConversationId ? (messagesByConversation[activeConversationId] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatOpen) {
      dispatch(fetchConversations());
      const loadSuggestions = async () => {
        try {
          const response = await feedService.getSuggestedResearchers();
          const people = Array.isArray(response?.data) ? response.data : [];
          setSuggestedPeople(people);
        } catch (error) {
          console.error('Failed to load suggested researchers', error);
        }
      };
      loadSuggestions();
    }
  }, [chatOpen, dispatch]);

  useEffect(() => {
    if (chatOpen && conversations.length && !activeConversationId) {
      dispatch(setActiveConversationId(conversations[0]._id || conversations[0].id));
    }
  }, [chatOpen, conversations, activeConversationId, dispatch]);

  useEffect(() => {
    if (chatOpen && activeConversationId) {
      dispatch(fetchMessages(activeConversationId));
      dispatch(markConversationRead(activeConversationId));
    }
  }, [chatOpen, activeConversationId, dispatch]);

  useEffect(() => {
    const participantFromRoute = new URLSearchParams(location.search).get('participantId');
    if (chatOpen && participantFromRoute) {
      dispatch(createConversation(participantFromRoute));
    }
  }, [chatOpen, location.search, dispatch]);

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom();
    }
  }, [chatOpen, activeMessages.length]);

  const getConversationTitle = (conversation) => {
    const otherParticipants = (conversation.participants || []).filter((participant) => {
      const participantId = participant?._id || participant;
      return participantId?.toString() !== user?._id?.toString();
    });

    const names = otherParticipants.map((participant) => participant?.fullName || participant?.email || participant?.username || 'Researcher');
    if (names.length) {
      return names.join(', ');
    }

    return conversation.title || `Conversation ${String(conversation._id || conversation.id).slice(-4)}`;
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!text.trim() || !activeConversationId) {
      toast.error('Select a conversation and type a message.');
      return;
    }

    try {
      await dispatch(sendMessageToConversation({ conversationId: activeConversationId, content: text.trim() })).unwrap();
      setText('');
      scrollToBottom();
    } catch (error) {
      toast.error(error?.message || 'Failed to send message.');
    }
  };

  const handleCreateConversation = async (event) => {
    event.preventDefault();
    if (!participantId.trim()) {
      toast.error('Enter another user ID to start a chat.');
      return;
    }

    try {
      const conversation = await dispatch(createConversation(participantId.trim())).unwrap();
      setParticipantId('');
      dispatch(setActiveConversationId(conversation._id || conversation.id));
      dispatch(fetchMessages(conversation._id || conversation.id));
      toast.success('Conversation started.');
    } catch (error) {
      toast.error(error?.message || 'Could not start a conversation.');
    }
  };

  const handleStartSuggestedConversation = async (person) => {
    const participant = person.userId || person._id || person.id;
    if (!participant) return;

    try {
      const conversation = await dispatch(createConversation(participant)).unwrap();
      dispatch(setActiveConversationId(conversation._id || conversation.id));
      dispatch(fetchMessages(conversation._id || conversation.id));
      toast.success(`Started a conversation with ${person.name || person.fullName || 'the researcher'}.`);
    } catch (error) {
      toast.error(error?.message || 'Could not start a conversation.');
    }
  };

  const handleStartCall = () => {
    dispatch(toggleMeeting(true));
    dispatch(setMeetingRoomId(`meeting_${Math.floor(Math.random() * 9000) + 1000}`));
  };

  if (!chatOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-colors duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {user?.fullName?.charAt(0) || 'R'}
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {activeConversation ? getConversationTitle(activeConversation) : 'Messages'}
            </h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Connected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <button
            onClick={handleStartCall}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Start Video Meeting"
          >
            <Video className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => dispatch(setChatOpen(false))}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20">
        <form onSubmit={handleCreateConversation} className="flex gap-2">
          <input
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            placeholder="Start chat with user ID"
            className="flex-1 p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all"
            title="Start conversation"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Suggested people</p>
        <div className="flex flex-wrap gap-2">
          {suggestedPeople.slice(0, 6).map((person, index) => (
            <button
              key={person.userId || person._id || person.id || index}
              onClick={() => handleStartSuggestedConversation(person)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                {(person.name || person.fullName || 'R').charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-semibold text-slate-800">
                  {person.name || person.fullName || 'Researcher'}
                </span>
                <span className="block truncate text-[9px] text-slate-500">
                  {person.designation || person.institution || 'Scholar'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 p-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto bg-slate-50/20">
        {conversations.map((conversation) => {
          const conversationId = conversation._id || conversation.id;
          return (
            <button
              key={conversationId}
              onClick={() => {
                dispatch(setActiveConversationId(conversationId));
                dispatch(fetchMessages(conversationId));
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                conversationId === activeConversationId
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350'
              }`}
            >
              {getConversationTitle(conversation)}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && !activeMessages.length ? (
          <div className="flex items-center justify-center py-6 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading messages...
          </div>
        ) : null}

        {!loading && !activeMessages.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 text-center">
            No messages yet. Start the conversation above.
          </div>
        ) : null}

        {activeMessages.map((message, index) => {
          // Backend messages carry `senderId` (string, ObjectId, or populated
          // user object) — not `sender`. Normalize before comparing so real
          // conversations correctly split into left/right bubbles.
          const rawSender = message.senderId ?? message.sender;
          const senderId = (rawSender && typeof rawSender === 'object') ? (rawSender._id || rawSender.id) : rawSender;
          const currentUserId = user?.userId || user?._id || user?.id;
          const isMe = senderId != null && currentUserId != null && senderId.toString() === currentUserId.toString();
          return (
            <div key={message._id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} text-left`}>
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                {message.content}
                {message.attachments?.length ? (
                  <div className="mt-2.5 p-3 rounded-xl bg-black/10 dark:bg-white/10 border border-white/10 flex items-start gap-2.5">
                    <FileText className="w-6 h-6 text-white/80" />
                    <div>
                      <h4 className="font-bold text-[11px] leading-tight text-white">Shared attachment</h4>
                      <p className="text-[9px] text-white/60 mt-0.5">Attachment from message</p>
                    </div>
                  </div>
                ) : null}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 px-1">
                {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Now'}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {meetingActive && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl p-6 text-center text-slate-900"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-650 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Virtual Video Meeting
                </h3>
                <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-bold">Room ID: {meetingRoomId}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 h-64 mb-6">
                <div className="bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180" alt="Self" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/75 text-white px-2 py-0.5 rounded-full font-bold">You</span>
                </div>
                <div className="bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=180" alt="Peer" className="w-full h-full object-cover animate-pulse" />
                  <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/75 text-white px-2 py-0.5 rounded-full font-bold">{activeConversation ? getConversationTitle(activeConversation) : 'Peer'}</span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    dispatch(toggleMeeting(false));
                    toast.success('Meeting finished.');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full text-xs transition-all shadow-md active:scale-[0.98]"
                >
                  End Meeting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 transition-colors"
          title="Share Publication"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="text"
          placeholder="Type message here..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="flex-1 p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-left"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-sm disabled:opacity-60"
          disabled={sending || !activeConversationId}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default MessagesView;
