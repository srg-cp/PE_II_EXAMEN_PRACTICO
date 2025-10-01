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
  Tooltip
} from '@mui/material';
import {
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';

const ChangeHistory = ({ projectId }) => {
  const { socket } = useSocket();
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!socket || !projectId) return;

    // Escuchar nuevas entradas del historial
    socket.on('history-entry-added', (entry) => {
      setHistory(prev => [entry, ...prev].slice(0, 50)); // Mantener solo las últimas 50 entradas
    });

    return () => {
      socket.off('history-entry-added');
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
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return time.toLocaleDateString();
  };

  const getSectionDisplayName = (sectionKey) => {
    const sectionNames = {
      mission: 'Misión',
      vision: 'Visión',
      objectives: 'Objetivos',
      valueChainDiagnostic: 'Cadena de Valor',
      strategy: 'Estrategia',
      conclusions: 'Conclusiones'
    };
    return sectionNames[sectionKey] || sectionKey;
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
      '#7b1fa2', '#303f9f', '#0288d1', '#00796b'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        position: 'fixed',
        top: 20,
        left: 20,
        zIndex: 1000,
        width: 350,
        maxHeight: '70vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon fontSize="small" />
          Historial de Cambios
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ maxHeight: '50vh', overflow: 'auto' }}>
          <List dense>
            {history.map((entry, index) => (
              <React.Fragment key={entry.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: getRandomColor(entry.user.id)
                      }}
                    >
                      {getUserInitials(entry.user.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {entry.user.name}
                        </Typography>
                        <Chip
                          icon={getChangeIcon(entry.changeType)}
                          label={getSectionDisplayName(entry.sectionKey)}
                          size="small"
                          color={getChangeColor(entry.changeType)}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(entry.timestamp)}
                        </Typography>
                        {entry.preview && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mt: 0.5,
                              p: 1,
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontStyle: 'italic'
                            }}
                          >
                            {entry.preview}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < history.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ChangeHistory;