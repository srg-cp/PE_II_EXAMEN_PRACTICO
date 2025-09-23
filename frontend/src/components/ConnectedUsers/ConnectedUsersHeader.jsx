import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  AvatarGroup,
  Typography,
  Chip,
  Tooltip,
  Paper,
  Badge
} from '@mui/material';
import {
  People as PeopleIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';

const ConnectedUsersHeader = ({ projectId }) => {
  const { socket } = useSocket();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    if (!socket || !projectId) return;

    // Escuchar actualizaciones de usuarios activos
    socket.on('active-users-updated', (data) => {
      setConnectedUsers(data.users || []);
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
    <Paper 
      elevation={1} 
      sx={{ 
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1200,
        p: 2,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Indicador de colaboración activa */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge
            badgeContent={connectedUsers.length}
            color="success"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#4CAF50',
                color: 'white',
                fontWeight: 'bold'
              }
            }}
          >
            <PeopleIcon color="primary" />
          </Badge>
          <Typography variant="body2" color="text.secondary">
            {connectedUsers.length === 1 ? 'colaborador' : 'colaboradores'} activos
          </Typography>
        </Box>

        {/* Lista de avatares de usuarios */}
        <AvatarGroup 
          max={4} 
          sx={{
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              fontSize: '0.875rem',
              border: '2px solid white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                zIndex: 1
              }
            }
          }}
        >
          {connectedUsers.map((user, index) => (
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
              placement="bottom"
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>          <CircleIcon 
            sx={{ 
              fontSize: 8, 
              color: '#4CAF50',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 }
              },
              animation: 'pulse 2s infinite'
            }} 
          />
          <Typography variant="caption" color="success.main">
            En vivo
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ConnectedUsersHeader;