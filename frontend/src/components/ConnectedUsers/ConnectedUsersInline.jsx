import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  AvatarGroup,
  Typography,
  Chip,
  Tooltip,
  Badge
} from '@mui/material';
import {
  People as PeopleIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';

const ConnectedUsersInline = ({ projectId }) => {
  const { socket } = useSocket();
  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    if (!socket || !projectId) return;

    // Escuchar actualizaciones de usuarios activos
    socket.on('active-users-updated', (data) => {
      // Filtrar duplicados por ID de usuario
      const uniqueUsers = data.users?.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      ) || [];
      
      setConnectedUsers(uniqueUsers);
    });

    // Solicitar usuarios conectados al unirse
    socket.emit('join-project', projectId);

    return () => {
      socket.off('active-users-updated');
    };
  }, [socket, projectId]);

  const getUserColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

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
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 2,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 2,
        border: '1px solid rgba(76, 175, 80, 0.3)',
        mb: 2
      }}
    >
      {/* Indicador de colaboración activa */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Badge
          badgeContent={connectedUsers.length}
          color="success"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#4CAF50',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }
          }}
        >
          <PeopleIcon color="success" />
        </Badge>
        <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
          {connectedUsers.length} colaborador{connectedUsers.length !== 1 ? 'es' : ''} activo{connectedUsers.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Lista de avatares de usuarios */}
      <AvatarGroup 
        max={6} 
        sx={{
          '& .MuiAvatar-root': {
            width: 36,
            height: 36,
            fontSize: '0.875rem',
            border: '2px solid white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              zIndex: 1
            }
          },
          '& .MuiAvatarGroup-avatar': {
            backgroundColor: '#666',
            fontSize: '0.75rem'
          }
        }}
      >
        {connectedUsers.map((user) => (
          <Tooltip 
            key={user.id} 
            title={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {user.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <CircleIcon sx={{ fontSize: 8, color: '#4CAF50' }} />
                  <Typography variant="caption">
                    Conectado desde {new Date(user.joinedAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            }
            placement="top"
          >
            <Avatar
              sx={{
                bgcolor: getUserColor(user.id),
                fontWeight: 'bold'
              }}
              src={user.avatar}
            >
              {!user.avatar && getInitials(user.name)}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>

      {/* Indicador de actividad en tiempo real */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>        <CircleIcon 
          sx={{ 
            fontSize: 10, 
            color: '#4CAF50',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 }
            },
            animation: 'pulse 2s infinite'
          }} 
        />
        <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
          En vivo
        </Typography>
      </Box>
    </Box>
  );
};

export default ConnectedUsersInline;