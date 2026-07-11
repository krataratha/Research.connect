import React, { useState } from 'react';
import { Search, Pin, Archive, MessageSquareCode, MoreVertical, Edit, Shield } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import messagesService from '../services/messages.service';

const ConversationList = ({ 
  conversations = [], 
  activeId, 
  onSelect,
  activeSubTab = 'all',
  setActiveSubTab
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Pin / Unpin Mutations
  const pinMutation = useMutation({
    mutationFn: async ({ id, pin }) => {
      return pin ? await messagesService.pinConversation(id) : await messagesService.unpinConversation(id);
    },
    onSuccess: (_, variables) => {
      toast.success(variables.pin ? 'Conversation pinned' : 'Conversation unpinned');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  });

  // Archive / Restore Mutations
  const archiveMutation = useMutation({
    mutationFn: async ({ id, archive }) => {
      return archive ? await messagesService.archiveConversation(id) : await messagesService.restoreConversation(id);
    },
    onSuccess: (_, variables) => {
      toast.success(variables.archive ? 'Conversation archived' : 'Conversation restored');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handlePinToggle = (conv, e) => {
    e.stopPropagation();
    pinMutation.mutate({ id: conv._id, pin: !conv.isPinned });
    setMenuOpenId(null);
  };

  const handleArchiveToggle = (conv, e) => {
    e.stopPropagation();
    archiveMutation.mutate({ id: conv._id, archive: !conv.isArchived });
    setMenuOpenId(null);
  };

  // Filter conversations
  const filtered = conversations.filter(conv => {
    // Search filter
    const name = conv.isGroup 
      ? conv.name.toLowerCase()
      : `${conv.otherParticipant?.firstName} ${conv.otherParticipant?.lastName}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeSubTab === 'unread') return conv.unreadCount > 0 && !conv.isArchived;
    if (activeSubTab === 'groups') return conv.isGroup && !conv.isArchived;
    if (activeSubTab === 'pinned') return conv.isPinned && !conv.isArchived;
    if (activeSubTab === 'archived') return conv.isArchived;
    return !conv.isArchived; // default all
  });

  // Format message timestamp
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    
    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Check if within this week
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }

    // Default date format
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-80 h-full border-r border-slate-200 bg-white flex flex-col shrink-0 select-none text-left">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
            Messages
          </h3>
          <button 
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            title="New Conversation"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Sub tabs filters (All, Unread, Groups) */}
      <div className="flex px-4 py-2 border-b border-slate-100 gap-4 bg-white">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'groups', label: 'Groups' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`pb-1.5 text-xs font-bold transition-all relative cursor-pointer ${
              activeSubTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 pr-1">
        {filtered.length > 0 ? (
          filtered.map((conv) => {
            const { otherParticipant, lastMessage, unreadCount, isPinned, isArchived, isGroup, name } = conv;
            const fullName = isGroup ? name : (otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Researcher');
            const isOnline = otherParticipant?.isOnline;
            const avatarUrl = isGroup ? '' : otherParticipant?.profileImage;

            return (
              <div
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                className={`p-4 flex items-start gap-3 hover:bg-slate-50/50 transition-colors cursor-pointer relative ${
                  activeId === conv._id ? 'bg-blue-55/40 border-l-4 border-blue-600 pl-3' : ''
                }`}
              >
                {/* Avatar with presence status indicator */}
                <div className="relative shrink-0 mt-0.5">
                  {isGroup ? (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-sm border border-slate-200">
                      {name ? name.substring(0, 2).toUpperCase() : 'GP'}
                    </div>
                  ) : (
                    <>
                      <img
                        src={avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                        alt={fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-100"
                      />
                      <span 
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`} 
                      />
                    </>
                  )}
                </div>

                {/* Text content details */}
                <div className="flex-1 min-w-0 space-y-0.5 pr-8 text-left">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-black text-slate-800 truncate flex-1 leading-tight flex items-center gap-1">
                      <span>{fullName}</span>
                      {!isGroup && <Shield className="w-3 h-3 text-blue-500 fill-blue-500 shrink-0" />}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">
                      {formatTime(conv.lastMessageAt || lastMessage?.createdAt)}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate leading-relaxed ${unreadCount > 0 ? 'text-slate-800 font-black' : 'text-slate-450 font-medium'}`}>
                    {lastMessage?.deleted 
                      ? 'Deleted message' 
                      : lastMessage?.type === 'publication' 
                        ? '📄 Shared a publication' 
                        : lastMessage?.text || 'No messages yet'}
                  </p>
                </div>

                {/* Action menu / Unread badge */}
                <div className="absolute right-4 top-4 flex flex-col items-end justify-between h-10 shrink-0">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === conv._id ? null : conv._id);
                      }}
                      className="p-1 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {menuOpenId === conv._id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 text-left space-y-0.5">
                        <button
                          onClick={(e) => handlePinToggle(conv, e)}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pin className="w-3 h-3" />
                          <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                        </button>
                        <button
                          onClick={(e) => handleArchiveToggle(conv, e)}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Archive className="w-3 h-3" />
                          <span>{isArchived ? 'Restore' : 'Archive'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <span className="w-4.5 h-4.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <MessageSquareCode className="w-8 h-8 mx-auto opacity-30 animate-pulse" />
            <p className="text-xs font-bold">No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
