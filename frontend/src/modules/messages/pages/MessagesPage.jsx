import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../../context/SocketContext';
import messagesService from '../services/messages.service';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import ResearcherInfo from '../components/ResearcherInfo';
import { ArrowLeft, UserPlus } from 'lucide-react';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const [activeId, setActiveId] = useState(conversationId || null);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'

  // Sync state with route parameters
  useEffect(() => {
    if (conversationId) {
      setActiveId(conversationId);
      setMobileView('chat');
    }
  }, [conversationId]);

  // Fetch active conversations list
  const { data: convData, isLoading: isConvLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await messagesService.getConversations();
      return res.data || [];
    }
  });

  const conversations = convData || [];
  const activeConversation = conversations.find(c => c._id === activeId);

  // Fetch messages history
  const { data: messagesData, isLoading: isMessagesLoading, refetch: refetchMessages } = useQuery({
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

  // Socket room joining and cleanups
  useEffect(() => {
    if (!socket || !activeId) return;

    // Join conversation room
    socket.emit('chat:join', { conversationId: activeId });
    // Trigger read mark
    markReadMutation.mutate(activeId);

    return () => {
      socket.emit('chat:leave', { conversationId: activeId });
    };
  }, [activeId, socket]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (payload) => {
      return await messagesService.sendMessage({
        conversationId: activeId,
        ...payload
      });
    },
    onSuccess: (res) => {
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

  const handleSelectConversation = (id) => {
    setActiveId(id);
    setMobileView('chat');
    navigate(`/messages/${id}`);
  };

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

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden relative border border-slate-100 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
      
      {/* Sidebar - Conversation list */}
      <div 
        className={`h-full border-r border-slate-200 transition-all duration-300 md:block ${
          mobileView === 'chat' ? 'hidden' : 'block w-full md:w-80'
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Main chat center view */}
      <div 
        className={`flex-1 h-full flex flex-col min-w-0 bg-white relative ${
          mobileView === 'list' && activeId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Mobile Header navigation */}
        {mobileView === 'chat' && activeId && (
          <div className="md:hidden flex items-center gap-2 p-3 bg-white border-b border-slate-150 z-20">
            <button 
              onClick={() => setMobileView('list')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black uppercase text-[#475569]">Back to list</span>
          </div>
        )}

        <ChatWindow
          conversation={activeConversation}
          messages={messagesList}
          isLoading={isMessagesLoading}
          onSendMessage={handleSendMessage}
          socket={socket}
        />
      </div>

      {/* Right details sidebar */}
      {activeConversation && (
        <div className="hidden lg:block h-full shrink-0">
          <ResearcherInfo
            participant={activeConversation.otherParticipant}
            messages={messagesList}
          />
        </div>
      )}

    </div>
  );
};

export default MessagesPage;
