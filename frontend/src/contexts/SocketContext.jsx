import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    console.warn('useSocket usado fuera de SocketProvider, devolviendo funciones vacías');
    return {
      socket: null,
      connected: false,
      joinProject: () => {},
      leaveProject: () => {},
      updateCard: () => {},
      updateDocument: () => {}
    };
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id,
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling'],
        upgrade: true
      });

      newSocket.on('connect', () => {
        console.log('✅ Conectado a Socket.io');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Desconectado de Socket.io');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Error de conexión Socket.io:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else if (socket) {
      socket.close();
      setSocket(null);
      setConnected(false);
    }
  }, [isAuthenticated, user]);

  // Funciones para eventos específicos
  const joinProject = (projectId) => {
    if (socket) {
      socket.emit('join-project', projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket) {
      socket.emit('leave-project', projectId);
    }
  };

  const updateCard = (projectId, cardData) => {
    if (socket) {
      socket.emit('card-updated', { projectId, cardData });
    }
  };

  const updateDocument = (projectId, documentData) => {
    if (socket) {
      socket.emit('document-updated', { projectId, documentData });
    }
  };

  const value = {
    socket,
    connected,
    joinProject,
    leaveProject,
    updateCard,
    updateDocument
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};