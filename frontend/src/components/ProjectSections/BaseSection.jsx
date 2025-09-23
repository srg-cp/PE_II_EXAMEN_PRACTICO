import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  Chip, 
  Avatar, 
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import { 
  History as HistoryIcon, 
  People as PeopleIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';

const BaseSection = ({ 
  projectId, 
  sectionKey, 
  children, 
  title,
  onContentChange,
  content 
}) => {
  const { socket } = useSocket(); // Usar el contexto en lugar de crear nueva conexión
  const [activeUsers, setActiveUsers] = useState([]);
  const [versionHistory, setVersionHistory] = useState([]);
  const [historyMenuAnchor, setHistoryMenuAnchor] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !projectId) return;

    // Escuchar cambios de otros usuarios
    socket.on('project-section-updated', (data) => {
      if (data.sectionKey === sectionKey) {
        onContentChange(data.content, false);
      }
    });

    // Escuchar usuarios activos
    socket.on('active-users-updated', (data) => {
      setActiveUsers(data.users.filter(user => user.id !== socket.userId));
    });

    // Cargar historial de versiones
    fetchVersionHistory();

    return () => {
      socket.off('project-section-updated');
      socket.off('active-users-updated');
    };
  }, [socket, projectId, sectionKey]);

  const fetchVersionHistory = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/projects/${projectId}/sections/${sectionKey}/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setVersionHistory(response.data);
    } catch (error) {
      console.error('Error fetching version history:', error);
    }
  };

  const handleContentChange = (newContent) => {
    onContentChange(newContent, true);
    
    // Emitir cambios a otros usuarios en tiempo real
    if (socket) {
      socket.emit('section-change', {
        projectId,
        sectionKey,
        content: newContent,
        userId: localStorage.getItem('userId')
      });
    }

    // Auto-guardar con debounce
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveContent(newContent);
    }, 2000); // Guardar después de 2 segundos de inactividad
  };

  const saveContent = async (contentToSave) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/projects/${projectId}/sections/${sectionKey}`,
        { content: contentToSave },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSaveStatus('saved');
      setLastSaved(new Date());
      fetchVersionHistory(); // Actualizar historial
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
    }
  };

  const restoreVersion = async (versionId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/projects/${projectId}/sections/${sectionKey}/restore/${versionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      onContentChange(response.data.content, false);
      setHistoryMenuAnchor(null);
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <SaveIcon sx={{ color: 'orange', animation: 'pulse 1s infinite' }} />;
      case 'saved':
        return <CheckCircleIcon sx={{ color: 'green' }} />;
      case 'error':
        return <SaveIcon sx={{ color: 'red' }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      {/* Header con título y controles */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Estado de guardado */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getSaveStatusIcon()}
            <Typography variant="caption" color="text.secondary">
              {saveStatus === 'saved' && lastSaved 
                ? `Guardado ${lastSaved.toLocaleTimeString()}`
                : saveStatus === 'saving' 
                ? 'Guardando...' 
                : saveStatus === 'error'
                ? 'Error al guardar'
                : 'Sin cambios'
              }
            </Typography>
          </Box>

          {/* Usuarios activos */}
          {activeUsers.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {activeUsers.slice(0, 3).map((user) => (
                  <Tooltip key={user.id} title={user.name}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
                {activeUsers.length > 3 && (
                  <Chip 
                    label={`+${activeUsers.length - 3}`} 
                    size="small" 
                    sx={{ height: 24, fontSize: 10 }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Historial de versiones */}
          <IconButton 
            onClick={(e) => setHistoryMenuAnchor(e.currentTarget)}
            size="small"
          >
            <HistoryIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Contenido de la sección */}
      <Box sx={{ height: 'calc(100% - 100px)' }}>
        {React.cloneElement(children, {
          content,
          onChange: handleContentChange
        })}
      </Box>

      {/* Menú de historial */}
      <Menu
        anchorEl={historyMenuAnchor}
        open={Boolean(historyMenuAnchor)}
        onClose={() => setHistoryMenuAnchor(null)}
        PaperProps={{
          sx: { width: 350, maxHeight: 400 }
        }}
      >
        <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
          Historial de Versiones
        </Typography>
        <Divider />
        <List sx={{ p: 0 }}>
          {versionHistory.map((version) => (
            <ListItem 
              key={version._id} 
              button 
              onClick={() => restoreVersion(version._id)}
            >
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                  {version.author.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${version.author.name}`}
                secondary={`${new Date(version.createdAt).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      </Menu>
    </Box>
  );
};

export default BaseSection;