import { useContext } from 'react';
import { SocketContext } from '../contexts/SocketContext';

export const useSocketSafe = () => {
  try {
    const context = useContext(SocketContext);
    if (!context) {
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
  } catch (error) {
    console.warn('Socket context no disponible:', error.message);
    return {
      socket: null,
      connected: false,
      joinProject: () => {},
      leaveProject: () => {},
      updateCard: () => {},
      updateDocument: () => {}
    };
  }
};