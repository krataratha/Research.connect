import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket.io server');
    });

    newSocket.on('connect_error', (err) => {
      console.warn('🔌 Socket connection error:', err.message);
    });

    // Listen for new real-time notifications
    newSocket.on('notification:new', (notification) => {
      console.log('🔔 Real-time notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      
      // Real-time UI Toast Alert
      toast((t) => (
        <div className="flex items-start gap-3 text-left">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-650 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
            {notification.actorId?.firstName?.charAt(0) || 'N'}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-slate-900">{notification.title}</p>
            <p className="text-[10px] text-slate-500 font-semibold leading-normal">{notification.message}</p>
          </div>
        </div>
      ), { duration: 4000 });

      // Invalidate count and list queries
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Listen for real-time unread count updates
    newSocket.on('notification:count', ({ count }) => {
      console.log('🔔 Real-time count update received:', count);
      queryClient.setQueryData(['unreadCount'], { count });
    });

    // Listen for notification updates (e.g. marked read)
    newSocket.on('notification:update', (updatedNotification) => {
      setNotifications((prev) => 
        prev.map(n => n._id === updatedNotification._id ? { ...n, ...updatedNotification } : n)
      );
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    });

    // Listen for notification deletes
    newSocket.on('notification:delete', (deletedId) => {
      setNotifications((prev) => prev.filter(n => n._id !== deletedId));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    });

    // Listen for new messages
    newSocket.on('message:new', (message) => {
      console.log('💬 Socket: message:new received:', message);
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    // Listen for message updates (edits, reactions, deletes)
    newSocket.on('message:update', (updatedMessage) => {
      queryClient.invalidateQueries({ queryKey: ['messages', updatedMessage.conversationId] });
    });

    // Listen for read receipts
    newSocket.on('message:read', ({ conversationId, readBy }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    // Listen for typing signals
    newSocket.on('typing:start', ({ conversationId, userId }) => {
      window.dispatchEvent(new CustomEvent('typing:start', { detail: { conversationId, userId } }));
    });

    newSocket.on('typing:stop', ({ conversationId, userId }) => {
      window.dispatchEvent(new CustomEvent('typing:stop', { detail: { conversationId, userId } }));
    });

    // Listen for user presence changes
    newSocket.on('presence:update', ({ userId, status, lastSeen }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      window.dispatchEvent(new CustomEvent('presence:update', { detail: { userId, status, lastSeen } }));
    });

    // Listen for conversation sidebar lists updates
    newSocket.on('conversation:update', ({ conversationId, lastMessage }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Database se purane notifications load karo
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Backend se notifications laao (chahe toh local bhi save kar sakte hain)
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
