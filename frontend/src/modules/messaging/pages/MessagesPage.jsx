import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../../context/SocketContext';
import messagesService from '../services/messages.service';
import networkService from '../../connections/services/network.service';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import ResearcherInfo from '../components/ResearcherInfo';
import CallOverlay from '../components/CallOverlay';
import NewChatModal from '../components/NewChatModal';
import { 
  MessageSquare, Mail, Star, Archive, Users, 
  Lightbulb, UserPlus, PhoneCall, FolderOpen, FileText, Ban, 
  Settings, Loader2, Shield, X, Check, Phone, Video, Search, Download, ExternalLink,
  SlidersHorizontal, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const userQueryId = searchParams.get('user');
  const conversationQueryId = searchParams.get('conversation');

  const [activeId, setActiveId] = useState(conversationId || null);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [showFolderDrawer, setShowFolderDrawer] = useState(false);
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState('inbox'); // inbox, unread, starred, archived, groups, collaboration, requests, calls, files, settings
  const [activeSubTab, setActiveSubTab] = useState('all'); // all, unread, groups (used inside ConversationList)
  const [filesSearch, setFilesSearch] = useState('');

  // Call Overlay State
  const [callState, setCallState] = useState({
    status: 'idle', // 'idle' | 'dialing' | 'incoming' | 'active' | 'ended'
    type: 'voice',  // 'voice' | 'video'
    callerName: '',
    callerImage: '',
    callId: null,
    targetUserId: null
  });

  // Fetch active conversations list
  const { data: convData, isLoading: isConvLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await messagesService.getConversations();
      return res.data || [];
    }
  });

  const conversations = convData || [];

  const handleSelectConversation = (id) => {
    setActiveId(id);
    setMobileView('chat');
    navigate(`/messages/${id}`);
  };

  // Sync state with route parameters
  useEffect(() => {
    if (conversationId) {
      setActiveId(conversationId);
      setMobileView('chat');
    }
  }, [conversationId]);

  // Handle "?user=userId" query parameter to auto-open or create conversation
  useEffect(() => {
    if (!userQueryId || isConvLoading) return;

    // Check if we already have a conversation with this participant
    const existingConv = conversations.find(
      c => c.otherParticipant?._id === userQueryId || c.participants?.some(p => p?._id === userQueryId)
    );

    if (existingConv) {
      handleSelectConversation(existingConv._id);
    } else {
      const startNewChat = async () => {
        try {
          const res = await messagesService.createConversation(userQueryId);
          if (res.success && res.data) {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['messagingContacts'] });
            handleSelectConversation(res.data._id);
          }
        } catch (err) {
          console.error('Failed to create new DM from query parameter:', err);
        }
      };
      startNewChat();
    }
  }, [userQueryId, isConvLoading, conversations]);

  // Handle "?conversation=conversationId" query parameter to auto-select conversation
  useEffect(() => {
    if (conversationQueryId) {
      handleSelectConversation(conversationQueryId);
    }
  }, [conversationQueryId]);

  const activeConversation = conversations.find(c => c._id === activeId);

  // Fetch connection requests (incoming) — now served by messaging module
  const { data: requestsData, refetch: refetchRequests } = useQuery({
    queryKey: ['networkRequests'],
    queryFn: async () => {
      const res = await messagesService.getRequests();
      return res.data || [];
    }
  });

  const incomingRequests = requestsData || [];

  // Fetch messaging contacts (connections + followers + following with online status)
  const { data: contactsData } = useQuery({
    queryKey: ['messagingContacts'],
    queryFn: async () => {
      const res = await messagesService.getContacts();
      return res.data || { connections: [], followers: [], following: [] };
    },
    staleTime: 60_000
  });

  const contactConnections = contactsData?.connections || [];
  const contactFollowers  = contactsData?.followers  || [];
  const contactFollowing  = contactsData?.following  || [];

  // Fetch Call History logs
  const { data: callHistoryData, isLoading: isCallsLoading } = useQuery({
    queryKey: ['callHistory'],
    queryFn: async () => {
      const res = await messagesService.getCallHistory();
      return res.data || [];
    },
    enabled: activeTab === 'calls'
  });

  // Fetch Shared Files list
  const { data: sharedFilesData, isLoading: isFilesLoading } = useQuery({
    queryKey: ['sharedFiles'],
    queryFn: async () => {
      const res = await messagesService.getSharedFiles();
      return res.data || [];
    },
    enabled: activeTab === 'files'
  });

  // Fetch messages history
  const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['messages', activeId],
    queryFn: async () => {
      if (!activeId) return null;
      const res = await messagesService.getMessages(activeId, { limit: 50 });
      return res.data || { docs: [] };
    },
    enabled: !!activeId
  });

  const messagesList = messagesData?.docs || [];

  // Mark conversation read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      return await messagesService.markAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Connection Request Actions Mutations
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      return await networkService.acceptRequest(requestId);
    },
    onSuccess: () => {
      toast.success('Connection accepted! DM initiated.');
      queryClient.invalidateQueries({ queryKey: ['networkRequests'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messagingContacts'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to accept request.');
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      return await messagesService.rejectRequest(requestId);
    },
    onSuccess: () => {
      toast.success('Request declined.');
      queryClient.invalidateQueries({ queryKey: ['networkRequests'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to decline request.');
    }
  });

  // Socket room joining and cleanups
  useEffect(() => {
    if (!socket || !activeId) return;

    socket.emit('chat:join', { conversationId: activeId });
    markReadMutation.mutate(activeId);

    return () => {
      socket.emit('chat:leave', { conversationId: activeId });
    };
  }, [activeId, socket]);

  // Socket event listeners for calling signaling
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ callerId, callerName, callerImage, callId, type }) => {
      setCallState({
        status: 'incoming',
        type,
        callerName,
        callerImage,
        callId,
        targetUserId: callerId
      });
    };

    const handleCallAccepted = () => {
      setCallState(prev => ({ ...prev, status: 'active' }));
    };

    const handleCallRejected = () => {
      toast.error('Call rejected by researcher');
      setCallState({ status: 'idle', type: 'voice', callerName: '', callerImage: '', callId: null, targetUserId: null });
    };

    const handleCallHungup = () => {
      setCallState({ status: 'idle', type: 'voice', callerName: '', callerImage: '', callId: null, targetUserId: null });
    };

    // Auto-update conversation list when new message is received globally
    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (activeId) {
        queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
      }
    };

    // Auto-update conversation list when new conversation is added (e.g. on accepting connection request)
    const handleNewConversation = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    // Listen for message delivered receipts (delivery tick on sender side)
    const handleMessageDelivered = ({ messageId, conversationId: convId }) => {
      if (convId) {
        queryClient.invalidateQueries({ queryKey: ['messages', convId] });
      }
    };

    // Real-time message updates (edits, deletions, reactions)
    const handleMessageUpdate = () => {
      if (activeId) {
        queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleConversationUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:hungup', handleCallHungup);
    socket.on('message:new', handleNewMessage);
    socket.on('receiveMessage', handleNewMessage);
    socket.on('conversation:new', handleNewConversation);
    socket.on('message:delivered', handleMessageDelivered);
    socket.on('messageDelivered', handleMessageDelivered);
    socket.on('message:update', handleMessageUpdate);
    socket.on('messageEdited', handleMessageUpdate);
    socket.on('messageDeleted', handleMessageUpdate);
    socket.on('reactionAdded', handleMessageUpdate);
    socket.on('reactionRemoved', handleMessageUpdate);
    socket.on('conversation:update', handleConversationUpdate);
    socket.on('conversationUpdated', handleConversationUpdate);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:hungup', handleCallHungup);
      socket.off('message:new', handleNewMessage);
      socket.off('receiveMessage', handleNewMessage);
      socket.off('conversation:new', handleNewConversation);
      socket.off('message:delivered', handleMessageDelivered);
      socket.off('messageDelivered', handleMessageDelivered);
      socket.off('message:update', handleMessageUpdate);
      socket.off('messageEdited', handleMessageUpdate);
      socket.off('messageDeleted', handleMessageUpdate);
      socket.off('reactionAdded', handleMessageUpdate);
      socket.off('reactionRemoved', handleMessageUpdate);
      socket.off('conversation:update', handleConversationUpdate);
      socket.off('conversationUpdated', handleConversationUpdate);
    };
  }, [socket, activeId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (payload) => {
      return await messagesService.sendMessage({
        conversationId: activeId,
        ...payload
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, text }) => {
      return await messagesService.editMessage(messageId, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
    }
  });

  const handleSendMessage = (payload) => {
    if (payload.action === 'edit') {
      editMessageMutation.mutate({ messageId: payload.messageId, text: payload.text });
    } else {
      sendMessageMutation.mutate({
        text: payload.text,
        type: payload.type,
        attachmentId: payload.attachmentId,
        replyTo: payload.replyTo
      });
    }
  };

  // Start a new DM from the ConversationList People section
  const handleStartNewChatFromList = async (userId) => {
    try {
      const res = await messagesService.createConversation(userId);
      if (res.success && res.data) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messagingContacts'] });
        handleSelectConversation(res.data._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start conversation.');
    }
  };

  // Calling handlers
  const handleStartCall = async (type) => {
    if (!activeConversation?.otherParticipant) return;
    const targetUser = activeConversation.otherParticipant;

    try {
      const res = await messagesService.startCall({
        type,
        targetUserId: targetUser._id,
        conversationId: activeConversation._id
      });

      const call = res.data;
      setCallState({
        status: 'dialing',
        type,
        callerName: `${targetUser.firstName} ${targetUser.lastName}`,
        callerImage: targetUser.profileImage,
        callId: call._id,
        targetUserId: targetUser._id,
        initiator: true
      });

      if (socket) {
        socket.emit('call:initiate', {
          targetUserId: targetUser._id,
          type,
          conversationId: activeConversation._id,
          callId: call._id
        });
      }
    } catch (err) {
      toast.error('Could not initiate WebRTC call');
    }
  };

  const handleAcceptCall = async () => {
    if (socket && callState.targetUserId) {
      socket.emit('call:accept', {
        callerId: callState.targetUserId,
        callId: callState.callId
      });
    }
    setCallState(prev => ({ ...prev, status: 'active' }));
  };

  const handleDeclineCall = async () => {
    if (socket && callState.targetUserId) {
      socket.emit('call:reject', {
        callerId: callState.targetUserId,
        callId: callState.callId
      });
    }
    await messagesService.endCall(callState.callId, 'rejected');
    setCallState({ status: 'idle', type: 'voice', callerName: '', callerImage: '', callId: null, targetUserId: null });
  };

  const handleHangupCall = async () => {
    if (socket && callState.targetUserId) {
      socket.emit('call:hangup', {
        targetUserId: callState.targetUserId,
        callId: callState.callId
      });
    }
    await messagesService.endCall(callState.callId, 'completed');
    setCallState({ status: 'idle', type: 'voice', callerName: '', callerImage: '', callId: null, targetUserId: null });
  };

  // Filter conversations for the sidebar based on activeTab
  const getFilteredConversations = () => {
    if (activeTab === 'unread') return conversations.filter(c => c.unreadCount > 0);
    if (activeTab === 'starred') return conversations.filter(c => c.isPinned);
    if (activeTab === 'archived') return conversations.filter(c => c.isArchived);
    if (activeTab === 'groups') return conversations.filter(c => c.isGroup);
    if (activeTab === 'collaboration') return conversations.filter(c => c.isGroup); // Collaboration maps to group rooms
    return conversations.filter(c => !c.isArchived); // 'inbox' tab
  };

  const currentTabConversations = getFilteredConversations();

  // Calculations for unread counts
  const totalUnreadCount = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

  // Open or create a DM conversation from a contact card
  const handleOpenContactDM = async (contact) => {
    if (contact.existingConversationId) {
      handleSelectConversation(contact.existingConversationId);
      setActiveTab('inbox');
      return;
    }
    try {
      const res = await messagesService.createConversation(contact._id);
      if (res.success && res.data) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messagingContacts'] });
        handleSelectConversation(res.data._id);
        setActiveTab('inbox');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not open conversation.');
    }
  };

  // Folder sidebar items list
  const sidebarFolders = [
    { id: 'inbox', label: 'Inbox', icon: MessageSquare, badge: totalUnreadCount > 0 ? totalUnreadCount : null },
    { id: 'unread', label: 'Unread', icon: Mail },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'archived', label: 'Archived', icon: Archive },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'collaboration', label: 'Research Collaboration', icon: Lightbulb },
    { id: 'followers', label: 'Followers', icon: Users, badge: contactFollowers.length > 0 ? contactFollowers.length : null },
    { id: 'following', label: 'Following', icon: Users, badge: contactFollowing.length > 0 ? contactFollowing.length : null },
    { id: 'requests', label: 'Connection Requests', icon: UserPlus, badge: incomingRequests.length > 0 ? incomingRequests.length : null },
    { id: 'calls', label: 'Calls', icon: PhoneCall },
    { id: 'files', label: 'Shared Files', icon: FolderOpen },
    { id: 'drafts', label: 'Drafts', icon: FileText },
    { id: 'blocked', label: 'Blocked Users', icon: Ban },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const activeFolder = sidebarFolders.find(f => f.id === activeTab);
  const ActiveFolderIcon = activeFolder?.icon;

  const selectFolder = (folderId) => {
    setActiveTab(folderId);
    if (folderId === 'unread') setActiveSubTab('unread');
    else if (folderId === 'groups') setActiveSubTab('groups');
    else setActiveSubTab('all');
    setShowFolderDrawer(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6 md:-m-8 bg-slate-50/50 overflow-hidden relative select-none">

      {/* Filter trigger button — shows Workspace Folders panel only when clicked. Mobile: hidden once inside a chat. Desktop: always visible. */}
      {[
        { wrapperClass: 'md:hidden', show: mobileView !== 'chat' },
        { wrapperClass: 'hidden md:flex', show: true }
      ].map(({ wrapperClass, show }, i) => show && (
        <div key={i} className={`${wrapperClass} items-center gap-2 px-4 py-2.5 bg-white border-b border-slate-100 shrink-0`}>
          <button
            onClick={() => setShowFolderDrawer(true)}
            className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border active:scale-95 ${
              showFolderDrawer
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 border-transparent hover:bg-slate-200 text-slate-700'
            }`}
            title="Filter by workspace folder"
          >
            <SlidersHorizontal className={`w-3.5 h-3.5 ${showFolderDrawer ? 'text-white' : 'text-blue-600'}`} />
            <span>Filter</span>
            <span className={`w-px h-3.5 ${showFolderDrawer ? 'bg-white/30' : 'bg-slate-300'}`} />
            {ActiveFolderIcon && <ActiveFolderIcon className={`w-3.5 h-3.5 ${showFolderDrawer ? 'text-white' : 'text-blue-600'}`} />}
            <span>{activeFolder?.label || 'Inbox'}</span>
            {activeFolder?.badge ? (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${showFolderDrawer ? 'bg-white/25 text-white' : 'bg-blue-600 text-white'}`}>{activeFolder.badge}</span>
            ) : null}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFolderDrawer ? 'rotate-180 text-white' : 'text-slate-400'}`} />
          </button>
        </div>
      ))}

      {/* Workspace Folders — filter panel, only shown when the user clicks "Filter" above. Positioned within this page's own container (absolute, not fixed) so it never overlaps the app's main sidenav. */}
      {showFolderDrawer && (
        <div
          className="absolute inset-0 z-50 flex items-end md:items-stretch md:justify-start"
          onClick={() => setShowFolderDrawer(false)}
        >
          <div className="absolute inset-0 bg-black/30 animate-in fade-in duration-150" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full md:w-72 max-h-[75vh] md:max-h-full md:h-full bg-white rounded-t-3xl md:rounded-none md:rounded-r-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-left duration-200"
          >
            <div className="md:hidden w-10 h-1 bg-slate-200 rounded-full mx-auto my-2.5 shrink-0" />
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 shrink-0">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Workspace Folders</span>
              </h2>
              <button
                onClick={() => setShowFolderDrawer(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {sidebarFolders.map((folder) => {
                const IconComponent = folder.icon;
                const isActive = activeTab === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => selectFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 md:py-2.5 rounded-2xl md:rounded-xl text-sm md:text-xs font-bold transition-all cursor-pointer ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4.5 h-4.5 md:w-4 md:h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{folder.label}</span>
                    </div>
                    {folder.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {folder.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 2. Middle Content Section (Changes based on selected Folder tab) */}
      <div className="flex-1 min-h-0 flex overflow-hidden bg-white">
        {activeTab === 'followers' ? (
          /* Followers Panel */
          <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/20 text-left">
            <div className="mb-6">
              <h3 className="text-base font-extrabold text-slate-800">Followers</h3>
              <p className="text-xs text-slate-450 font-semibold mt-0.5">Researchers who follow your work. You can message them directly.</p>
            </div>
            {contactFollowers.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {contactFollowers.map((person) => (
                  <div key={person._id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={person.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt={`${person.firstName} ${person.lastName}`} className="w-12 h-12 rounded-full object-cover border border-slate-150" />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${person.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-800 truncate">{person.firstName} {person.lastName}</h4>
                        <p className="text-xs text-slate-500 font-bold truncate">{person.designation || 'Researcher'}</p>
                        <p className="text-xs text-slate-400 font-semibold truncate">{person.institution}</p>
                      </div>
                      <button
                        onClick={() => handleOpenContactDM(person)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/10 shrink-0"
                      >
                        {person.existingConversationId ? 'Open Chat' : 'Message'}
                      </button>
                    </div>
                    {person.bio && <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl">"{person.bio}"</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-3">
                <Users className="w-12 h-12 mx-auto opacity-30 animate-pulse" />
                <p className="text-sm font-black">No followers yet.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'following' ? (
          /* Following Panel */
          <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/20 text-left">
            <div className="mb-6">
              <h3 className="text-base font-extrabold text-slate-800">Following</h3>
              <p className="text-xs text-slate-450 font-semibold mt-0.5">Researchers you follow. Start a conversation directly.</p>
            </div>
            {contactFollowing.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {contactFollowing.map((person) => (
                  <div key={person._id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={person.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt={`${person.firstName} ${person.lastName}`} className="w-12 h-12 rounded-full object-cover border border-slate-150" />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${person.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-800 truncate">{person.firstName} {person.lastName}</h4>
                        <p className="text-xs text-slate-500 font-bold truncate">{person.designation || 'Researcher'}</p>
                        <p className="text-xs text-slate-400 font-semibold truncate">{person.institution}</p>
                      </div>
                      <button
                        onClick={() => handleOpenContactDM(person)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/10 shrink-0"
                      >
                        {person.existingConversationId ? 'Open Chat' : 'Message'}
                      </button>
                    </div>
                    {person.bio && <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl">"{person.bio}"</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-3">
                <Users className="w-12 h-12 mx-auto opacity-30 animate-pulse" />
                <p className="text-sm font-black">You are not following anyone yet.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'requests' ? (
          /* Connection Requests List Page View */
          <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/20 text-left">
            <div className="mb-6">
              <h3 className="text-base font-extrabold text-slate-800">Connection Requests</h3>
              <p className="text-xs text-slate-450 font-semibold mt-0.5">Manage incoming collaborations from fellow researchers.</p>
            </div>
            
            {incomingRequests.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {incomingRequests.map((req) => {
                  const { user, profile, hasGoogleScholar, _id } = req;
                  const reqName = `${user.firstName} ${user.lastName}`;
                  return (
                    <div key={_id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <img 
                          src={user.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                          alt={reqName} 
                          className="w-14 h-14 rounded-full object-cover border border-slate-150"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-slate-800 truncate leading-snug">{reqName}</h4>
                            <Shield className="w-4 h-4 text-blue-600 fill-blue-600" />
                            {hasGoogleScholar && (
                              <span className="px-1.5 py-0.5 bg-sky-50 text-[9px] text-sky-600 font-extrabold rounded-md uppercase border border-sky-100">
                                Google Scholar
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-bold truncate mt-0.5">{profile?.designation || 'Researcher'}</p>
                          <p className="text-xs text-slate-400 font-semibold truncate">{profile?.institution || 'Academic Institution'}</p>
                        </div>
                        {profile?.metrics?.researchScore > 0 && (
                          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1 rounded-2xl text-center">
                            <p className="text-[9px] font-black uppercase text-emerald-500">Score</p>
                            <p className="text-xs font-black">{profile.metrics.researchScore}</p>
                          </div>
                        )}
                      </div>

                      {/* Bio excerpt */}
                      {profile?.bio && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl">
                          "{profile.bio}"
                        </p>
                      )}

                      {/* Research Areas */}
                      {profile?.skills && profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {profile.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-lg font-bold">
                              {typeof skill === 'string' ? skill : skill.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
                        <div className="text-[10px] text-slate-400 font-bold">
                          Received {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => rejectRequestMutation.mutate(_id)}
                            className="px-4 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                          <button 
                            onClick={() => acceptRequestMutation.mutate(_id)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-3">
                <UserPlus className="w-12 h-12 mx-auto opacity-30 animate-pulse" />
                <p className="text-sm font-black">All caught up! No connection requests.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'calls' ? (
          /* Calls History Logs View */
          <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/20 text-left">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Call History</h3>
                <p className="text-xs text-slate-450 font-semibold mt-0.5">Logs of all voice and video signaling meetings.</p>
              </div>
            </div>

            {isCallsLoading ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : callHistoryData && callHistoryData.length > 0 ? (
              <>
                {/* Mobile card list */}
                <div className="sm:hidden space-y-2.5">
                  {callHistoryData.map((call) => {
                    const other = call.participants.find(p => p._id !== socket?.userId);
                    const contactName = other ? `${other.firstName} ${other.lastName}` : 'Researcher';
                    const isVideo = call.type === 'video';
                    return (
                      <div key={call._id} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                        <img
                          src={other?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                          alt={contactName}
                          className="w-10 h-10 rounded-full object-cover border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-black text-slate-800 truncate">{contactName}</p>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              call.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : call.status === 'missed'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : 'bg-slate-50 text-slate-655 border border-slate-150'
                            }`}>
                              {call.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-450 font-semibold mt-0.5">
                            {isVideo ? '📹 Video' : '📞 Voice'} • {call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : '--'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{new Date(call.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tablet / desktop table */}
                <div className="hidden sm:block bg-white border border-slate-200 rounded-3xl overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse min-w-[560px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                      <th className="p-4">Contact</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                    {callHistoryData.map((call) => {
                      const other = call.participants.find(p => p._id !== socket?.userId);
                      const contactName = other ? `${other.firstName} ${other.lastName}` : 'Researcher';
                      const isVideo = call.type === 'video';
                      
                      return (
                        <tr key={call._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img 
                              src={other?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"} 
                              alt={contactName} 
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                            <span>{contactName}</span>
                          </td>
                          <td className="p-4 capitalize">
                            {isVideo ? '📹 Video Call' : '📞 Voice Call'}
                          </td>
                          <td className="p-4 text-slate-400 font-semibold">
                            {new Date(call.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 tabular-nums">
                            {call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : '--'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              call.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : call.status === 'missed' 
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                  : 'bg-slate-50 text-slate-655 border border-slate-150'
                            }`}>
                              {call.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-3">
                <PhoneCall className="w-12 h-12 mx-auto opacity-30" />
                <p className="text-sm font-black">No call logs found</p>
              </div>
            )}
          </div>
        ) : activeTab === 'files' ? (
          /* Shared Files Gallery View */
          <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/20 text-left">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Shared Files</h3>
                <p className="text-xs text-slate-450 font-semibold mt-0.5">Access all PDFs, research papers, and datasets exchanged.</p>
              </div>
              <div className="relative w-64 shrink-0">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search shared files..."
                  value={filesSearch}
                  onChange={(e) => setFilesSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all text-slate-700 shadow-xs"
                />
              </div>
            </div>

            {isFilesLoading ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : sharedFilesData && sharedFilesData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedFilesData
                  .filter(m => m.attachment?.filename?.toLowerCase().includes(filesSearch.toLowerCase()))
                  .map((msg) => {
                    const { attachment, senderId } = msg;
                    if (!attachment) return null;
                    return (
                      <div key={msg._id} className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-650 shrink-0 font-extrabold text-sm">
                            📄
                          </div>
                          <div className="min-w-0 text-left">
                            <h5 className="text-xs font-black text-slate-800 truncate leading-snug" title={attachment.filename}>
                              {attachment.filename}
                            </h5>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                              {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB • {attachment.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                            <img 
                              src={senderId?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50"} 
                              alt="Sender" 
                              className="w-5 h-5 rounded-full object-cover border"
                            />
                            <span className="truncate max-w-[80px]">By {senderId?.firstName}</span>
                          </div>
                          <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 hover:scale-105 active:scale-95 text-blue-600 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-xs"
                            title="Download/Open File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-3">
                <FolderOpen className="w-12 h-12 mx-auto opacity-30" />
                <p className="text-sm font-black">No shared files found</p>
              </div>
            )}
          </div>
        ) : activeTab === 'settings' ? (
          /* Chat Settings View */
          <div className="flex-1 h-full overflow-y-auto p-6 bg-slate-50/20 text-left">
            <div className="mb-6">
              <h3 className="text-base font-extrabold text-slate-800">Chat Settings</h3>
              <p className="text-xs text-slate-450 font-semibold mt-0.5">Manage preferences, blocklists, and security keys.</p>
            </div>

            <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Notifications</h4>
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-bold text-slate-850">Desktop Notifications</p>
                    <p className="text-slate-400 font-semibold mt-0.5">Show banner alerts for incoming messages and call rings.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Privacy & Security</h4>
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-bold text-slate-850">End-to-End Encryption Keys</p>
                    <p className="text-slate-400 font-semibold mt-0.5">Regenerate and sync cryptographic keys for secure media sharing.</p>
                  </div>
                  <button className="px-3.5 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50/30 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    Regenerate Keys
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h4 className="text-xs font-black uppercase text-red-500 tracking-wider">Danger Zone</h4>
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-bold text-slate-850">Clear Conversations History</p>
                    <p className="text-slate-400 font-semibold mt-0.5">Permanently delete all text messages logs from client memory.</p>
                  </div>
                  <button className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    Clear History
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Messaging Workflow (Inbox, Starred, Groups, etc.) */
          <>
            {/* Conversation list */}
            <div 
              className={`h-full transition-all duration-300 md:block shrink-0 ${
                mobileView === 'chat' ? 'hidden' : 'block w-full md:w-80'
              }`}
            >
              <ConversationList
                conversations={currentTabConversations}
                activeId={activeId}
                onSelect={handleSelectConversation}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                contacts={contactsData}
                onStartNewChat={handleStartNewChatFromList}
                onComposeClick={() => setIsComposeOpen(true)}
              />
            </div>

            {/* Main chat window center view */}
            <div 
              className={`flex-1 h-full flex flex-col min-w-0 bg-white relative ${
                mobileView === 'list' && activeId ? 'hidden md:flex' : 'flex'
              }`}
            >
              <ChatWindow
                conversation={activeConversation}
                messages={messagesList}
                isLoading={isMessagesLoading}
                onSendMessage={handleSendMessage}
                onStartCall={handleStartCall}
                socket={socket}
                showInfoPanel={showInfoPanel}
                setShowInfoPanel={setShowInfoPanel}
                onBack={() => setMobileView('list')}
              />
            </div>

            {/* Right details sidebar (desktop) / bottom sheet overlay (mobile & tablet) */}
            {activeConversation && showInfoPanel && (
              <>
                <div className="hidden lg:block h-full shrink-0 animate-in slide-in-from-right duration-200">
                  <ResearcherInfo
                    participant={activeConversation.otherParticipant}
                    conversation={activeConversation}
                    messages={messagesList}
                    onClose={() => setShowInfoPanel(false)}
                  />
                </div>

                <div
                  className="lg:hidden fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center"
                  onClick={() => setShowInfoPanel(false)}
                >
                  <div className="absolute inset-0 bg-black/30" />
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full sm:w-96 max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                  >
                    <div className="sm:hidden w-10 h-1 bg-slate-200 rounded-full mx-auto my-2.5 shrink-0" />
                    <ResearcherInfo
                      participant={activeConversation.otherParticipant}
                      conversation={activeConversation}
                      messages={messagesList}
                      onClose={() => setShowInfoPanel(false)}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Call Overlay Panel */}
      <CallOverlay
        callState={callState}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
        onHangup={handleHangupCall}
        socket={socket}
      />

      {/* Compose / New Chat Modal */}
      <NewChatModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        contacts={contactsData}
        onSelectContact={handleStartNewChatFromList}
      />
    </div>
  );
};

export default MessagesPage;