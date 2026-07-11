import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

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

    // Naye collaboration requests aane pe suno
    newSocket.on('NEW_COLLABORATION_REQUEST', (data) => {
      console.log('📣 Real-time notification received: NEW_COLLABORATION_REQUEST', data);
      setNotifications((prev) => [data.notification, ...prev]);
    });

    // Jab koi collaboration accept kare toh alert lo
    newSocket.on('COLLABORATION_REQUEST_ACCEPTED', (data) => {
      console.log('📣 Real-time notification received: COLLABORATION_REQUEST_ACCEPTED', data);
      setNotifications((prev) => [data.notification, ...prev]);
    });

    // Nayi connection requests aane pe suno
    newSocket.on('NEW_CONNECTION_REQUEST', (data) => {
      console.log('📣 Real-time notification received: NEW_CONNECTION_REQUEST', data);
      setNotifications((prev) => [data.notification, ...prev]);
    });

    // Jab koi connection accept kare toh alert lo
    newSocket.on('CONNECTION_REQUEST_ACCEPTED', (data) => {
      console.log('📣 Real-time notification received: CONNECTION_REQUEST_ACCEPTED', data);
      setNotifications((prev) => [data.notification, ...prev]);
    });

    // Koi naya follower aaye toh notify karo
    newSocket.on('NEW_FOLLOWER', (data) => {
      console.log('📣 Real-time notification received: NEW_FOLLOWER', data);
      setNotifications((prev) => [data.notification, ...prev]);
    });

    // Jinko follow kiya hai, unki nayi publications aane pe suno
    newSocket.on('NEW_PUBLICATION_BY_FOLLOWED', (data) => {
      console.log('📣 Real-time notification received: NEW_PUBLICATION_BY_FOLLOWED', data);
      setNotifications((prev) => [data.notification, ...prev]);
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
