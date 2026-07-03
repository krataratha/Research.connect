import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Pin, Archive, FolderHeart, MessageSquareCode, BellOff, MoreVertical, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import messagesService from '../services/messages.service';

const ConversationList = ({ conversations = [], activeId, onSelect }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('recent'); // recent, pinned, archived, unread
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
    const name = `${conv.otherParticipant?.firstName} ${conv.otherParticipant?.lastName}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeSubTab === 'pinned') return conv.isPinned;
    if (activeSubTab === 'archived') return conv.isArchived;
    if (activeSubTab === 'unread') return conv.unreadCount > 0 && !conv.isArchived;
    // 'recent' shows active, unarchived chats (pinned can be shown at the top or filtered out, let's show all unarchived in recent)
    return !conv.isArchived;
  });

  return (
    <div className="w-80 h-full border-r border-slate-200 bg-white flex flex-col shrink-0 select-none text-left">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
          Conversations
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Sub tabs filters */}
      <div className="flex px-2 py-2 border-b border-slate-100 gap-1 overflow-x-auto bg-slate-50/50">
        {[
          { id: 'recent', label: 'Recent' },
          { id: 'pinned', label: 'Pinned' },
          { id: 'unread', label: 'Unread' },
          { id: 'archived', label: 'Archived' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-550 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
        {filtered.length > 0 ? (
          filtered.map((conv) => {
            const { otherParticipant, lastMessage, unreadCount, isPinned, isArchived } = conv;
            const fullName = otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Researcher';
            const isOnline = otherParticipant?.isOnline;

            return (
              <div
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                className={`p-4 flex items-start gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer relative ${
                  activeId === conv._id ? 'bg-blue-50/30' : ''
                }`}
              >
                {/* Avatar with presence status indicator */}
                <div className="relative shrink-0">
                  <img
                    src={otherParticipant?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                    alt={fullName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                  <span 
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} 
                  />
                </div>

                {/* Text content details */}
                <div className="flex-1 min-w-0 space-y-0.5 pr-6 text-left">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-black text-slate-850 truncate flex-1 leading-tight">
                      {fullName}
                    </h4>
                    {isPinned && <Pin className="w-3 h-3 text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-450 font-bold truncate leading-relaxed">
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
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {menuOpenId === conv._id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 text-left space-y-0.5 animate-in fade-in duration-100">
                        <button
                          onClick={(e) => handlePinToggle(conv, e)}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Pin className="w-3 h-3" />
                          <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                        </button>
                        <button
                          onClick={(e) => handleArchiveToggle(conv, e)}
                          className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Archive className="w-3 h-3" />
                          <span>{isArchived ? 'Restore' : 'Archive'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <span className="w-4.5 h-4.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <MessageSquareCode className="w-8 h-8 mx-auto opacity-40 animate-pulse" />
            <p className="text-xs font-bold">No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
