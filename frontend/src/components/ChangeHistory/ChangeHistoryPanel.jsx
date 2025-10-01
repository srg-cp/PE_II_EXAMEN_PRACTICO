import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Pagination,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  alpha,
  useTheme,
  Fab,
  Container,
  Grid,
  ListItemButton
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Restore as RestoreIcon,
  Compare as CompareIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';

const ChangeHistoryPanel = ({ projectId }) => {
  const { socket } = useSocket();
  const theme = useTheme();
  
  // Estados principales
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados de filtros y búsqueda
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    changeType: 'all',
    userId: 'all',
    dateRange: 'all'
  });
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estados de usuarios conectados
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [projectStats, setProjectStats] = useState(null);
  
  // Estados de diálogos
  const [restoreDialog, setRestoreDialog] = useState({ open: false, entry: null });
  const [compareDialog, setCompareDialog] = useState({ open: false, entries: [] });
  const [detailDialog, setDetailDialog] = useState({ open: false, entry: null });
  
  // Estados de configuración
  const [showMinorChanges, setShowMinorChanges] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const sections = [
    { key: 'all', label: 'General', icon: '📋', color: theme.palette.primary.main },
    { key: 'mission', label: 'Misión', icon: '🎯', color: theme.palette.primary.main },
    { key: 'vision', label: 'Visión', icon: '👁️', color: theme.palette.info.main },
    { key: 'objectives', label: 'Objetivos', icon: '🎯', color: theme.palette.success.main },
    { key: 'valueChainDiagnostic', label: 'Cadena de Valor', icon: '📊', color: theme.palette.warning.main },
    { key: 'strategy', label: 'Estrategia', icon: '🚀', color: theme.palette.error.main },
    { key: 'conclusions', label: 'Conclusiones', icon: '✅', color: theme.palette.secondary.main }
  ];

  // Cargar historial de cambios - CORREGIDO
  const fetchHistory = useCallback(async (page = 1, resetData = false) => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const sectionKey = sections[activeTab].key;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(sectionKey !== 'all' && { sectionKey }),
        ...(selectedFilters.changeType !== 'all' && { changeType: selectedFilters.changeType }),
        ...(selectedFilters.userId !== 'all' && { userId: selectedFilters.userId }),
        ...(searchQuery && { search: searchQuery }),
        ...(showMinorChanges === false && { excludeMinor: 'true' })
      });
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}/history?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // CORREGIR: La respuesta del backend tiene estructura diferente
      const { entries: newHistory, pagination, stats } = response.data;
      
      if (resetData || page === 1) {
        setHistory(newHistory || []);
      } else {
        setHistory(prev => [...prev, ...(newHistory || [])]);
      }
      
      if (pagination) {
        setCurrentPage(pagination.page);
        setTotalPages(pagination.pages);
        setTotalCount(pagination.total);
      }
      
      if (stats) {
        setProjectStats(stats);
      }
      
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Error al cargar el historial de cambios');
      setSnackbar({
        open: true,
        message: 'Error al cargar el historial',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, activeTab, selectedFilters, searchQuery, showMinorChanges]);

  // ... existing code ...
  useEffect(() => {
    if (expanded) {
      fetchHistory(1, true);
    }
  }, [expanded, fetchHistory]);

  useEffect(() => {
    if (!socket || !projectId) return;

    // Escuchar nuevas entradas del historial en tiempo real
    socket.on('history-entry-added', (entry) => {
      if (autoRefresh) {
        setHistory(prev => [entry, ...prev]);
        setTotalCount(prev => prev + 1);
      }
    });

    // Escuchar usuarios conectados
    socket.on('users-updated', (users) => {
      setConnectedUsers(users);
    });

    return () => {
      socket.off('history-entry-added');
      socket.off('users-updated');
    };
  }, [socket, projectId, autoRefresh]);

  // Funciones de utilidad
  const getChangeIcon = (changeType) => {
    const iconProps = { fontSize: 'small' };
    switch (changeType) {
      case 'create': return <AddIcon {...iconProps} sx={{ color: theme.palette.success.main }} />;
      case 'edit': return <EditIcon {...iconProps} sx={{ color: theme.palette.primary.main }} />;
      case 'delete': return <DeleteIcon {...iconProps} sx={{ color: theme.palette.error.main }} />;
      case 'restore': return <RestoreIcon {...iconProps} sx={{ color: theme.palette.warning.main }} />;
      default: return <EditIcon {...iconProps} />;
    }
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'create': return 'success';
      case 'edit': return 'primary';
      case 'delete': return 'error';
      case 'restore': return 'warning';
      default: return 'default';
    }
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
      theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main,
      theme.palette.secondary.main, theme.palette.info.main, '#0288d1', '#00796b',
      '#c2185b', '#5d4037', '#455a64', '#e65100'
    ];
    // Convertir userId a string para evitar el error
    const userIdString = String(userId || 'default');
    const index = userIdString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return time.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const getSectionInfo = (sectionKey) => {
    return sections.find(s => s.key === sectionKey) || sections[0];
  };

  // Funciones de acciones
  const handleRestore = async (entry) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}/history/${entry._id}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setSnackbar({
        open: true,
        message: 'Versión restaurada exitosamente',
        severity: 'success'
      });
      
      setRestoreDialog({ open: false, entry: null });
      fetchHistory(1, true);
      
    } catch (error) {
      console.error('Error restoring version:', error);
      setSnackbar({
        open: true,
        message: 'Error al restaurar la versión',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
    setFilterMenuAnchor(null);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchHistory(currentPage + 1, false);
    }
  };

  // Componente de entrada del historial - MEJORADO CON MATERIAL DESIGN 3
  const HistoryEntry = ({ entry, index }) => {
    const sectionInfo = getSectionInfo(entry.sectionKey);
    const [entryMenuAnchor, setEntryMenuAnchor] = useState(null);

    return (
      <>
        <ListItemButton
          sx={{
            py: 2,
            px: 3,
            borderRadius: 3, // Material Design 3: más redondeado
            mb: 1,
            backgroundColor: theme.palette.surfaceVariant || alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.outline || theme.palette.divider, 0.12)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4],
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                width: 48, // Material Design 3: tamaño estándar
                height: 48,
                bgcolor: getRandomColor(entry.user?.id || 'default'),
                fontSize: '1rem',
                fontWeight: 600,
                border: `3px solid ${theme.palette.surface || theme.palette.background.paper}`,
                boxShadow: theme.shadows[3]
              }}
            >
              {getUserInitials(entry.user?.name || 'Usuario')}
            </Avatar>
          </ListItemAvatar>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography 
                  variant="titleMedium" // Material Design 3 typography
                  fontWeight={600} 
                  color="onSurface"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {entry.user?.name || 'Usuario desconocido'}
                </Typography>
                
                <Chip
                  icon={getChangeIcon(entry.changeType)}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span style={{ fontSize: '0.875rem' }}>{sectionInfo.icon}</span>
                      <span>{sectionInfo.label}</span>
                    </Box>
                  }
                  size="small"
                  variant="filled" // Material Design 3: filled chips
                  color={getChangeColor(entry.changeType)}
                  sx={{
                    height: 28,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: '14px', // Material Design 3: más redondeado
                    '& .MuiChip-label': { px: 1.5 }
                  }}
                />
                
                <Typography 
                  variant="labelSmall" // Material Design 3 typography
                  color="outline"
                  sx={{ 
                    ml: 'auto',
                    color: theme.palette.text.secondary,
                    fontWeight: 500
                  }}
                >
                  {formatTime(entry.createdAt)}
                </Typography>
                
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEntryMenuAnchor(e.currentTarget);
                  }}
                  sx={{ 
                    ml: 0.5,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12)
                    }
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            }
            
            secondary={
              <Box sx={{ mt: 1.5 }}>
                {entry.preview && (
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: alpha(sectionInfo.color, 0.08),
                      borderRadius: 2,
                      borderLeft: `4px solid ${sectionInfo.color}`,
                      mb: 1.5,
                      border: `1px solid ${alpha(sectionInfo.color, 0.2)}`
                    }}
                  >
                    <Typography
                      variant="bodySmall" // Material Design 3 typography
                      sx={{
                        fontSize: '0.875rem',
                        fontStyle: 'italic',
                        color: theme.palette.text.secondary,
                        lineHeight: 1.5
                      }}
                    >
                      {entry.preview}
                    </Typography>
                  </Card>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  <Chip
                    label={`v${entry.version || 1}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      borderColor: alpha(sectionInfo.color, 0.3),
                      color: sectionInfo.color,
                      fontWeight: 600,
                      borderRadius: '12px'
                    }}
                  />
                  
                  {entry.tags?.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 24,
                        fontSize: '0.65rem',
                        borderRadius: '12px'
                      }}
                    />
                  ))}
                  
                  {entry.metadata?.wordCount && (
                    <Typography 
                      variant="labelSmall" 
                      color="outline"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {entry.metadata.wordCount} palabras
                    </Typography>
                  )}
                </Box>
              </Box>
            }
          />
        </ListItemButton>
        
        {/* Menú contextual de entrada */}
        <Menu
          anchorEl={entryMenuAnchor}
          open={Boolean(entryMenuAnchor)}
          onClose={() => setEntryMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              borderRadius: 3, // Material Design 3
              boxShadow: theme.shadows[8],
              border: `1px solid ${alpha(theme.palette.outline || theme.palette.divider, 0.12)}`
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              setDetailDialog({ open: true, entry });
              setEntryMenuAnchor(null);
            }}
            sx={{ borderRadius: 1.5, mx: 1, my: 0.5 }}
          >
            <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} />
            Ver detalles
          </MenuItem>
          
          <MenuItem 
            onClick={() => {
              setRestoreDialog({ open: true, entry });
              setEntryMenuAnchor(null);
            }}
            sx={{ borderRadius: 1.5, mx: 1, my: 0.5 }}
          >
            <RestoreIcon fontSize="small" sx={{ mr: 1.5 }} />
            Restaurar versión
          </MenuItem>
          
          <MenuItem 
            onClick={() => {
              setCompareDialog({ open: true, entries: [entry] });
              setEntryMenuAnchor(null);
            }}
            sx={{ borderRadius: 1.5, mx: 1, my: 0.5 }}
          >
            <CompareIcon fontSize="small" sx={{ mr: 1.5 }} />
            Comparar
          </MenuItem>
        </Menu>
      </>
    );
  };

  return (
    <>
      {/* FAB para abrir/cerrar - MATERIAL DESIGN 3 */}
      {!expanded && (
        <Fab
          color="primary"
          onClick={() => setExpanded(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            width: 64,
            height: 64,
            boxShadow: theme.shadows[6],
            '&:hover': {
              boxShadow: theme.shadows[12],
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Badge badgeContent={totalCount} color="error" max={99}>
            <HistoryIcon sx={{ fontSize: 28 }} />
          </Badge>
        </Fab>
      )}

      {/* Panel principal - MATERIAL DESIGN 3 */}
      <Fade in={expanded}>
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 1300,
            width: 480,
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4, // Material Design 3: más redondeado
            border: `1px solid ${alpha(theme.palette.outline || theme.palette.divider, 0.12)}`,
            boxShadow: theme.shadows[16], // Material Design 3: sombra más prominente
            backdropFilter: 'blur(20px)',
            backgroundColor: theme.palette.surface || theme.palette.background.paper
          }}
        >
          {/* Header - MATERIAL DESIGN 3 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: theme.palette.primary.contrastText,
              borderRadius: '16px 16px 0 0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HistoryIcon sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="headlineSmall" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  Historial de Cambios
                </Typography>
                <Typography variant="labelMedium" sx={{ opacity: 0.9 }}>
                  {totalCount} cambios registrados
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Usuarios conectados */}
              <AvatarGroup
                max={3}
                sx={{
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    fontSize: '0.75rem',
                    border: `2px solid ${theme.palette.primary.contrastText}`,
                    boxShadow: theme.shadows[2]
                  }
                }}
              >
                {connectedUsers.map((user) => (
                  <Tooltip key={user.id} title={`${user.name} - En línea`}>
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
                size="medium"
                onClick={() => setExpanded(false)}
                sx={{ 
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.contrastText, 0.12)
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Barra de herramientas - MATERIAL DESIGN 3 */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.outline || theme.palette.divider, 0.12)}` }}>
            {/* Búsqueda */}
            <TextField
              fullWidth
              size="medium"
              placeholder="Buscar en el historial..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 4, // Material Design 3
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4
                  }
                }
              }}
              sx={{ mb: 2 }}
            />

            {/* Controles */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  size="medium"
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  <FilterIcon />
                </IconButton>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMinorChanges}
                      onChange={(e) => setShowMinorChanges(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="labelLarge">
                      Cambios menores
                    </Typography>
                  }
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="labelLarge">
                    Auto-actualizar
                  </Typography>
                }
              />
            </Box>
          </Box>

          {/* Pestañas de secciones - MATERIAL DESIGN 3 */}
          <Box sx={{ borderBottom: `1px solid ${alpha(theme.palette.outline || theme.palette.divider, 0.12)}` }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  padding: '12px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: '12px 12px 0 0',
                  textTransform: 'none'
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {sections.map((section, index) => {
                const sectionCount = index === 0 
                  ? totalCount 
                  : history.filter(h => h.sectionKey === section.key).length;
                
                return (
                  <Tab
                    key={section.key}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1rem' }}>{section.icon}</span>
                        <Typography variant="labelLarge" fontWeight={600}>
                          {section.label}
                        </Typography>
                        {sectionCount > 0 && (
                          <Badge
                            badgeContent={sectionCount}
                            color={index === 0 ? 'primary' : 'secondary'}
                            max={99}
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.65rem',
                                height: 18,
                                minWidth: 18,
                                borderRadius: '9px'
                              }
                            }}
                          />
                        )}
                      </Box>
                    }
                    sx={{ minHeight: 56 }}
                  />
                );
              })}
            </Tabs>
          </Box>

          {/* Lista de cambios - MATERIAL DESIGN 3 */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              maxHeight: '60vh',
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(theme.palette.outline || '#000', 0.05),
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.outline || '#000', 0.2),
                borderRadius: '4px',
                '&:hover': {
                  background: alpha(theme.palette.outline || '#000', 0.3)
                }
              }
            }}
          >
            {loading && history.length === 0 ? (
              <Box sx={{ p: 3 }}>
                {[...Array(5)].map((_, i) => (
                  <Box key={i} sx={{ mb: 3 }}>
                    <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                ))}
              </Box>
            ) : error ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  {error}
                </Alert>
                <Button
                  variant="outlined"
                  onClick={() => fetchHistory(1, true)}
                  startIcon={<UndoIcon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Reintentar
                </Button>
              </Box>
            ) : history.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                <HistoryIcon sx={{ fontSize: 64, mb: 3, opacity: 0.3 }} />
                <Typography variant="titleMedium" gutterBottom fontWeight={600}>
                  No hay cambios en esta sección
                </Typography>
                <Typography variant="bodyMedium" color="text.secondary">
                  Los cambios aparecerán aquí cuando edites el proyecto
                </Typography>
              </Box>
            ) : (
              <>
                <List sx={{ p: 2 }}>
                  {history.map((entry, index) => (
                    <HistoryEntry key={entry._id || entry.id || index} entry={entry} index={index} />
                  ))}
                </List>

                {/* Botón cargar más */}
                {currentPage < totalPages && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={handleLoadMore}
                      disabled={loading}
                      startIcon={loading ? <LinearProgress /> : <KeyboardArrowDownIcon />}
                      sx={{ 
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4
                      }}
                    >
                      {loading ? 'Cargando...' : 'Cargar más cambios'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Estadísticas del proyecto - MATERIAL DESIGN 3 */}
          {projectStats && (
            <Box sx={{ 
              p: 3, 
              borderTop: `1px solid ${alpha(theme.palette.outline || theme.palette.divider, 0.12)}`, 
              bgcolor: alpha(theme.palette.surfaceVariant || theme.palette.primary.main, 0.04)
            }}>
              <Typography variant="labelLarge" color="text.secondary" gutterBottom fontWeight={600}>
                Estadísticas del proyecto
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="headlineSmall" color="primary" fontWeight={700}>
                      {projectStats.totalChanges || totalCount}
                    </Typography>
                    <Typography variant="labelMedium" color="text.secondary">Cambios</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="headlineSmall" color="secondary" fontWeight={700}>
                      {projectStats.uniqueUsersCount || connectedUsers.length}
                    </Typography>
                    <Typography variant="labelMedium" color="text.secondary">Usuarios</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="headlineSmall" color="success.main" fontWeight={700}>
                      {Math.round(projectStats.projectAge || 0)}
                    </Typography>
                    <Typography variant="labelMedium" color="text.secondary">Días</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Fade>

      {/* Menú de filtros - MATERIAL DESIGN 3 */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            border: `1px solid ${alpha(theme.palette.outline || theme.palette.divider, 0.12)}`,
            minWidth: 200
          }
        }}
      >
        <MenuItem 
          onClick={() => handleFilterChange('changeType', 'all')}
          sx={{ borderRadius: 1.5, mx: 1, my: 0.5 }}
        >
          Todos los cambios
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterChange('changeType', 'edit')}
          sx={{ borderRadius: 1.5, mx: 1, my: 0.5 }}
        >
          Solo ediciones
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterChange('changeType', 'create')}
          sx={{ borderRadius: 1.5, mx: 1, my: 0.5 }}
        >
          Solo creaciones
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterChange('changeType', 'delete')}
          sx={{ borderRadius: 1.5, mx: 1, my: 0.5 }}
        >
          Solo eliminaciones
        </MenuItem>
      </Menu>

      {/* Diálogo de restauración - MATERIAL DESIGN 3 */}
      <Dialog
        open={restoreDialog.open}
        onClose={() => setRestoreDialog({ open: false, entry: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: theme.shadows[24]
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RestoreIcon color="warning" sx={{ fontSize: 28 }} />
            <Typography variant="headlineSmall" fontWeight={600}>
              Restaurar versión
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {restoreDialog.entry && (
            <Box>
              <Typography variant="bodyLarge" gutterBottom>
                ¿Estás seguro de que quieres restaurar esta versión?
              </Typography>
              <Card sx={{ 
                mt: 3, 
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                borderRadius: 3
              }}>
                <CardContent>
                  <Typography variant="titleMedium" gutterBottom fontWeight={600}>
                    Versión {restoreDialog.entry.version} - {getSectionInfo(restoreDialog.entry.sectionKey).label}
                  </Typography>
                  <Typography variant="bodyMedium" color="text.secondary">
                    Por {restoreDialog.entry.user?.name} • {formatTime(restoreDialog.entry.createdAt)}
                  </Typography>
                  {restoreDialog.entry.preview && (
                    <Typography variant="bodyMedium" sx={{ mt: 2, fontStyle: 'italic' }}>
                      "{restoreDialog.entry.preview}"
                    </Typography>
                  )}
                </CardContent>
              </Card>
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 3,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem'
                  }
                }}
              >
                Esta acción creará una nueva versión con el contenido restaurado.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setRestoreDialog({ open: false, entry: null })}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleRestore(restoreDialog.entry)}
            disabled={loading}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Restaurar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones - MATERIAL DESIGN 3 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            borderRadius: 3,
            fontWeight: 500,
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChangeHistoryPanel;