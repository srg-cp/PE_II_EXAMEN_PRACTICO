import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';

const ConnectedUsers = ({ projectId }) => {
  const { socket } = useSocket();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [hoveredUser, setHoveredUser] = useState(null);

  useEffect(() => {
    if (!socket || !projectId) return;

    // Unirse al proyecto para recibir actualizaciones de usuarios
    socket.emit('join-project', projectId);

    // Escuchar actualizaciones de usuarios conectados
    socket.on('users-updated', (users) => {
      setConnectedUsers(users);
    });

    // Solicitar lista inicial de usuarios
    socket.emit('get-connected-users', projectId);

    return () => {
      socket.off('users-updated');
    };
  }, [socket, projectId]);

  // Generar color único para cada usuario basado en su ID
  const getUserColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (connectedUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 relative">
      <span className="text-sm text-gray-600 mr-2">
        {connectedUsers.length} usuario{connectedUsers.length !== 1 ? 's' : ''} conectado{connectedUsers.length !== 1 ? 's' : ''}
      </span>
      
      <div className="flex -space-x-2">
        {connectedUsers.slice(0, 5).map((user, index) => (
          <div
            key={user.id}
            className="relative"
            onMouseEnter={() => setHoveredUser(user)}
            onMouseLeave={() => setHoveredUser(null)}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-white text-xs font-medium"
              style={{ 
                backgroundColor: getUserColor(user.id),
                zIndex: connectedUsers.length - index
              }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(user.name)
              )}
            </div>
            
            {/* Tooltip */}
            {hoveredUser?.id === user.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                {user.name}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
            
            {/* Indicador de actividad */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
        ))}
        
        {/* Mostrar +N si hay más usuarios */}
        {connectedUsers.length > 5 && (
          <div
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gray-500 flex items-center justify-center text-white text-xs font-medium cursor-pointer"
            onMouseEnter={() => setHoveredUser({ 
              id: 'more', 
              name: `+${connectedUsers.length - 5} más` 
            })}
            onMouseLeave={() => setHoveredUser(null)}
          >
            +{connectedUsers.length - 5}
            
            {hoveredUser?.id === 'more' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                {connectedUsers.slice(5).map(user => user.name).join(', ')}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectedUsers;