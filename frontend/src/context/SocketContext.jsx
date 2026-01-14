import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (user && !socketRef.current) {
      const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
        
        // Register user with socket
        socket.emit('register-user', user._id);
        socket.emit('user-online', user._id);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.on('incoming-call', (data) => {
        setIncomingCall({
          from: data.from,
          offer: data.offer,
          name: data.name,
          timestamp: new Date(),
        });
      });

      socket.on('user-online', (userId) => {
        console.log('User online:', userId);
      });

      socket.on('user-offline', (userId) => {
        console.log('User offline:', userId);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  const value = {
    socket: socketRef.current,
    isConnected,
    incomingCall,
    setIncomingCall,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};