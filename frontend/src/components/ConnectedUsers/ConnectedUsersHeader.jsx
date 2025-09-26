import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  AvatarGroup,
  Typography,
  Chip,
  Tooltip,
  Paper,
  Badge,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Circle as CircleIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme } from '../../contexts/ThemeContext';
import InviteParticipantsModal from '../InviteParticipantsModal';

const ConnectedUsersHeader = ({ projectId, inline = false }) => {
  const { socket } = useSocket();
  const { currentTheme } = useTheme();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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

  const getUserColor = (userId, index) => {
    // Usar colores basados en el tema actual
    const themeColors = [
      currentTheme.primary,
      currentTheme.secondary,
      currentTheme.primary + '80', // Versión más clara del primario
      currentTheme.secondary + '80', // Versión más clara del secundario
      '#f59e0b', // Mantener algunos colores adicionales para variedad
      '#10b981',
      '#8b5cf6',
      '#f97316',
      '#06b6d4',
      '#84cc16'
    ];
    
    // Usar el índice para una distribución más uniforme
    return themeColors[index % themeColors.length];
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

  // Diseño inline para usar al mismo nivel que el botón PDF
  if (inline) {
    return (
      <>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            p: 2,
            borderRadius: 3,
            backgroundColor: currentTheme.background,
            border: `1px solid ${currentTheme.primary}20`,
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Indicador de colaboración activa */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge
              badgeContent={connectedUsers.length}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: currentTheme.primary,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }
              }}
            >
              <PeopleIcon sx={{ color: currentTheme.primary }} />
            </Badge>
            <Typography 
              variant="body2" 
              sx={{ 
                color: currentTheme.secondary,
                fontWeight: 500
              }}
            >
              {connectedUsers.length === 1 ? 'colaborador' : 'colaboradores'} activos
            </Typography>
          </Box>

          {/* Lista de avatares de usuarios */}
          <AvatarGroup 
            max={5} 
            sx={{
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                border: `2px solid ${currentTheme.background}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  zIndex: 1,
                  boxShadow: `0 4px 12px ${currentTheme.primary}40`
                }
              },
              '& .MuiAvatarGroup-avatar': {
                backgroundColor: currentTheme.secondary,
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold'
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
                      <CircleIcon sx={{ fontSize: 8, color: currentTheme.primary }} />
                      <Typography variant="caption">
                        Conectado desde {new Date(user.joinedAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                }
                placement="bottom"
                arrow
              >
                <Avatar
                  sx={{
                    bgcolor: getUserColor(user.id, index),
                    fontWeight: 'bold'
                  }}
                  src={user.avatar}
                >
                  {!user.avatar && getInitials(user.name)}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>

          {/* Botón de compartir */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<ShareIcon />}
            onClick={() => setInviteModalOpen(true)}
            sx={{
              borderColor: currentTheme.primary,
              color: currentTheme.primary,
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 0.5,
              '&:hover': {
                backgroundColor: `${currentTheme.primary}10`,
                borderColor: currentTheme.primary
              }
            }}
          >
            Compartir
          </Button>

          {/* Indicador de actividad en tiempo real */}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CircleIcon 
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
            <Typography 
              variant="caption" 
              sx={{ color: currentTheme.primary, fontWeight: 500 }}
            >
              En vivo
            </Typography>
          </Box>
        </Box>

        {/* Modal de invitación */}
        <InviteParticipantsModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          projectId={projectId}
          currentMembers={connectedUsers}
        />
      </>
    );
  }
};

export default ConnectedUsersHeader;