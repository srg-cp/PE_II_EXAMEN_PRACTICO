import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  Divider,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  AvatarGroup,
  Fade,
  Button
} from '@mui/material';
import {
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';

const ChangeHistoryPanel = ({ projectId }) => {
  const { socket } = useSocket();
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [sectionHistory, setSectionHistory] = useState({});

  const sections = [
    { key: 'all', label: 'General', icon: '📋' },
    { key: 'mission', label: 'Misión', icon: '🎯' },
    { key: 'vision', label: 'Visión', icon: '👁️' },
    { key: 'objectives', label: 'Objetivos', icon: '📝' },
    { key: 'swot', label: 'FODA', icon: '📊' },
    { key: 'strategy', label: 'Estrategia', icon: '🎲' },
    { key: 'conclusions', label: 'Conclusiones', icon: '✅' }
  ];

  useEffect(() => {
    if (!socket || !projectId) return;

    // Escuchar nuevas entradas del historial
    socket.on('history-entry-added', (entry) => {
      setHistory(prev => [entry, ...prev].slice(0, 100));
      
      // Organizar por secciones
      setSectionHistory(prev => ({
        ...prev,
        [entry.sectionKey]: [entry, ...(prev[entry.sectionKey] || [])].slice(0, 50)
      }));
    });

    // Escuchar usuarios conectados
    socket.on('users-updated', (users) => {
      setConnectedUsers(users);
    });

    return () => {
      socket.off('history-entry-added');
      socket.off('users-updated');
    };
  }, [socket, projectId]);

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'edit':
        return <EditIcon fontSize="small" color="primary" />;
      case 'add':
        return <AddIcon fontSize="small" color="success" />;
      case 'delete':
        return <DeleteIcon fontSize="small" color="error" />;
      default:
        return <EditIcon fontSize="small" />;
    }
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'edit':
        return 'primary';
      case 'add':
        return 'success';
      case 'delete':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return time.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const getSectionDisplayName = (sectionKey) => {
    const section = sections.find(s => s.key === sectionKey);
    return section ? section.label : sectionKey;
  };

  const getSectionIcon = (sectionKey) => {
    const section = sections.find(s => s.key === sectionKey);
    return section ? section.icon : '📄';
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (userId) => {
    const colors = [
      '#1976d2', '#388e3c', '#f57c00', '#d32f2f',
      '#7b1fa2', '#303f9f', '#0288d1', '#00796b',
      '#c2185b', '#5d4037', '#455a64', '#e65100'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getCurrentHistory = () => {
    if (activeTab === 0) return history; // General
    const sectionKey = sections[activeTab].key;
    return sectionHistory[sectionKey] || [];
  };

  const getTabLabel = (section, index) => {
    if (index === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span>{section.icon}</span>
          <Typography variant="caption">{section.label}</Typography>
          <Badge badgeContent={history.length} color="primary" max={99} />
        </Box>
      );
    }
    
    const sectionCount = sectionHistory[section.key]?.length || 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <span>{section.icon}</span>
        <Typography variant="caption">{section.label}</Typography>
        {sectionCount > 0 && (
          <Badge badgeContent={sectionCount} color="secondary" max={99} />
        )}
      </Box>
    );
  };

  return (
    <Fade in={true}>
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 1200,
          width: expanded ? 420 : 60,
          maxHeight: expanded ? '80vh' : '60px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}
      >
        {/* Header con avatares de usuarios conectados */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          p: expanded ? 2 : 1,
          borderBottom: expanded ? '1px solid #e0e0e0' : 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          {expanded ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="600">
                  Historial
                </Typography>
              </Box>
              
              {/* Avatares de usuarios conectados estilo Google Docs */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AvatarGroup 
                  max={4} 
                  sx={{ 
                    '& .MuiAvatar-root': { 
                      width: 24, 
                      height: 24, 
                      fontSize: '0.7rem',
                      border: '2px solid white'
                    }
                  }}
                >
                  {connectedUsers.map((user) => (
                    <Tooltip key={user.id} title={`${user.name} - ${user.isOnline ? 'En línea' : 'Desconectado'}`}>
                      <Avatar
                        sx={{ 
                          bgcolor: getRandomColor(user.id),
                          opacity: user.isOnline ? 1 : 0.6
                        }}
                      >
                        {getUserInitials(user.name)}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
                
                <IconButton 
                  size="small" 
                  onClick={() => setExpanded(false)}
                  sx={{ color: 'white', ml: 1 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          ) : (
            <Tooltip title="Abrir historial de cambios">
              <IconButton 
                size="small" 
                onClick={() => setExpanded(true)}
                sx={{ color: 'white' }}
              >
                <Badge badgeContent={history.length} color="error" max={99}>
                  <HistoryIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Collapse in={expanded}>
          {/* Pestañas para secciones */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  padding: '6px 8px',
                  fontSize: '0.7rem'
                }
              }}
            >
              {sections.map((section, index) => (
                <Tab 
                  key={section.key} 
                  label={getTabLabel(section, index)}
                  sx={{ minHeight: 40 }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Lista de cambios */}
          <Box sx={{ 
            maxHeight: '60vh', 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '3px',
            }
          }}>
            {getCurrentHistory().length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <FilterIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2">
                  No hay cambios en esta sección
                </Typography>
              </Box>
            ) : (
              <List dense sx={{ p: 0 }}>
                {getCurrentHistory().map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    <ListItem 
                      alignItems="flex-start"
                      sx={{ 
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{ 
                            width: 32, 
                            height: 32,
                            bgcolor: getRandomColor(entry.user.id),
                            fontSize: '0.75rem'
                          }}
                        >
                          {getUserInitials(entry.user.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" fontWeight="500">
                              {entry.user.name}
                            </Typography>
                            <Chip
                              icon={getChangeIcon(entry.changeType)}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <span>{getSectionIcon(entry.sectionKey)}</span>
                                  <span>{getSectionDisplayName(entry.sectionKey)}</span>
                                </Box>
                              }
                              size="small"
                              color={getChangeColor(entry.changeType)}
                              variant="outlined"
                              sx={{ 
                                height: 22, 
                                fontSize: '0.65rem',
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(entry.timestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          entry.preview && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 0.5,
                                p: 1,
                                bgcolor: 'grey.50',
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontStyle: 'italic',
                                borderLeft: '3px solid',
                                borderLeftColor: `${getChangeColor(entry.changeType)}.main`
                              }}
                            >
                              {entry.preview}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                    {index < getCurrentHistory().length - 1 && (
                      <Divider variant="inset" component="li" sx={{ ml: 6 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Collapse>
      </Paper>
    </Fade>
  );
};

export default ChangeHistoryPanel;