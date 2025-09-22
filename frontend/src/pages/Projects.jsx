import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  Fab,
  Avatar,
  CardMedia,
  LinearProgress,
  AvatarGroup,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  ChatBubbleOutline as ChatIcon
} from '@mui/icons-material';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';

const Projects = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // El backend devuelve { projects: [...] }, necesitamos extraer el array
        const projectsArray = data.projects || data;
        setProjects(Array.isArray(projectsArray) ? projectsArray : []);
      } else {
        // Si la respuesta no es exitosa, mantener array vacío
        setProjects([]);
        console.error('Error fetching projects:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // En caso de error, asegurar que projects sea un array vacío
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects(prev => 
      prev.map(project => 
        project._id === updatedProject._id ? updatedProject : project
      )
    );
  };

  // Separar proyectos por rol - Agregar validación adicional
  const ownedProjects = Array.isArray(projects) ? projects.filter(project => project.owner?._id === user?._id) : [];
  const invitedProjects = Array.isArray(projects) ? projects.filter(project => project.owner?._id !== user?._id) : [];

  const ProjectCard = ({ project, isOwner }) => {
    // Usar datos reales del proyecto
    const progress = project.progress || 0;
    
    // Obtener participantes reales del backend - incluir owner y members/participants
    const allParticipants = [];
    
    // Agregar el owner como primer participante
    if (project.owner) {
      allParticipants.push({
        _id: project.owner._id,
        name: project.owner.name || project.owner.username || 'Owner',
        avatar: project.owner.avatar || project.owner.profileImage,
        email: project.owner.email
      });
    }
    
    // Agregar otros participantes/miembros (evitar duplicar el owner)
    const otherParticipants = project.participants || project.members || [];
    otherParticipants.forEach(participant => {
      if (participant._id !== project.owner?._id) {
        allParticipants.push({
          _id: participant._id,
          name: participant.name || participant.username || 'Usuario',
          avatar: participant.avatar || participant.profileImage,
          email: participant.email
        });
      }
    });
    
    const participants = allParticipants;
    const commentsCount = project.commentsCount || 0;
    
    return (
      <Grid item xs={12} sm={6} md={4} key={project._id}>
        <Card 
          sx={{ 
            height: 420, // Altura fija
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            },
            backgroundColor: 'white'
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 2.5, textAlign: 'center' }}>
            {/* Chip de rol en la esquina superior derecha */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Chip 
                icon={isOwner ? <PersonIcon /> : <GroupIcon />}
                label={isOwner ? 'Owner' : 'Invitado'}
                size="small"
                sx={{
                  backgroundColor: isOwner ? currentTheme.primary : currentTheme.secondary,
                  color: 'white',
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    color: 'white',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>
            
            {/* Imagen del proyecto o icono por defecto - MÁS COMPACTA */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
              {project.image ? (
                <Box
                  component="img"
                  src={project.image}
                  alt={project.name}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isOwner ? currentTheme.primary : currentTheme.secondary,
                    color: 'white'
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {project.name.charAt(0).toUpperCase()}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Título del proyecto con tooltip */}
            <Tooltip title={project.name} arrow placement="top">
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 0.5,
                  color: '#1f2937',
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  cursor: 'help'
                }}
              >
                {project.name}
              </Typography>
            </Tooltip>
            
            {/* Descripción con tooltip */}
            <Tooltip title={project.description || 'Sin descripción'} arrow placement="bottom">
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 1.5,
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  textAlign: 'center',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '2.24em',
                  maxHeight: '3.14em',
                  maxWidth: '100%',
                  cursor: 'help',
                  wordBreak: 'break-word'
                }}
              >
                {project.description || 'Sin descripción'}
              </Typography>
            </Tooltip>
            
            {/* Participantes - FUNCIONALES Y COMPACTOS */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>              
              <AvatarGroup 
                max={4}
                sx={{ 
                  '& .MuiAvatar-root': { 
                    width: 28, 
                    height: 28, 
                    fontSize: '0.75rem',
                    border: '2px solid white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  },
                  '& .MuiAvatarGroup-avatar': {
                    backgroundColor: '#6b7280',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }
                }}
              >
                {participants.slice(0, 3).map((participant, index) => {
                  // Generar colores basados en el tema actual
                  const themeColors = [
                    currentTheme.primary,
                    currentTheme.secondary,
                    currentTheme.primary + '80', // Versión más clara del primario
                    currentTheme.secondary + '80', // Versión más clara del secundario
                    '#f59e0b', // Mantener algunos colores adicionales para variedad
                    '#10b981'
                  ];
                  const backgroundColor = themeColors[index % themeColors.length];
                  
                  return (
                    <Tooltip 
                      key={participant._id || index}
                      title={`${participant.name}${participant.email ? ` (${participant.email})` : ''}`}
                      arrow
                      placement="top"
                    >
                      <Avatar 
                        src={participant.avatar || null}
                        sx={{ 
                          bgcolor: participant.avatar ? 'transparent' : backgroundColor,
                          width: 28,
                          height: 28,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {!participant.avatar && participant.name ? 
                          participant.name.charAt(0).toUpperCase() : 
                          'U'
                        }
                      </Avatar>
                    </Tooltip>
                  );
                })}
                {/* Si hay más de 3 participantes, mostrar el contador con tooltip */}
                {participants.length > 3 && (
                  <Tooltip 
                    title={`+${participants.length - 3} más: ${participants.slice(3).map(p => p.name).join(', ')}`}
                    arrow
                    placement="top"
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: currentTheme.secondary,
                        width: 28,
                        height: 28,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      +{participants.length - 3}
                    </Avatar>
                  </Tooltip>
                )}
              </AvatarGroup>
            </Box>
            
            {/* Progreso - MÁS COMPACTO */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#374151', fontSize: '0.875rem' }}>
                  Progress
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151', fontSize: '0.875rem' }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: currentTheme.primary,
                    borderRadius: 3
                  }
                }}
              />
            </Box>
            
            {/* Footer con comentarios y fecha - MÁS COMPACTO */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ChatIcon sx={{ fontSize: 14, color: currentTheme.secondary }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {commentsCount}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon sx={{ fontSize: 14, color: currentTheme.primary }} />
                <Typography variant="caption" sx={{ color: currentTheme.primary, fontSize: '0.75rem' }}>
                  {new Date(project.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
          
          {/* Botones de acción */}
          <CardActions sx={{ 
            justifyContent: 'space-between', 
            px: 2.5, 
            pb: 2,
            backgroundColor: `${currentTheme.primary}08`,
            borderRadius: '0 0 12px 12px'
          }}>
            <Button
              startIcon={<ViewIcon />}
              onClick={() => handleViewProject(project._id)}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: isOwner ? currentTheme.primary : currentTheme.secondary,
                fontSize: '0.8rem',
                borderRadius: 2,
                boxShadow: `0 2px 8px ${currentTheme.primary}40`,
                '&:hover': {
                  backgroundColor: isOwner ? currentTheme.primary + 'CC' : currentTheme.secondary + 'CC',
                  boxShadow: `0 4px 12px ${currentTheme.primary}60`
                }
              }}
            >
              Ver Proyecto
            </Button>
            
            {isOwner && (
              <IconButton 
                size="small" 
                sx={{ 
                  color: currentTheme.secondary,
                  backgroundColor: `${currentTheme.secondary}15`,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: `${currentTheme.secondary}25`,
                    color: currentTheme.primary
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProject(project);
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Cargando proyectos...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Mis Proyectos
        </Typography>
      </Box>

      {/* Proyectos donde soy Owner */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
          Mis Proyectos ({ownedProjects.length})
        </Typography>
        
        {ownedProjects.length > 0 ? (
          <Grid container spacing={3}>
            {ownedProjects.map(project => (
              <ProjectCard key={project._id} project={project} isOwner={true} />
            ))}
          </Grid>
        ) : (
          <Card sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
            <Typography color="text.secondary">
              No tienes proyectos creados aún. ¡Crea tu primer proyecto!
            </Typography>
          </Card>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Proyectos donde soy Invitado */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <GroupIcon sx={{ mr: 1, color: 'secondary.main' }} />
          Proyectos Colaborativos ({invitedProjects.length})
        </Typography>
        
        {invitedProjects.length > 0 ? (
          <Grid container spacing={3}>
            {invitedProjects.map(project => (
              <ProjectCard key={project._id} project={project} isOwner={false} />
            ))}
          </Grid>
        ) : (
          <Card sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
            <Typography color="text.secondary">
              No tienes proyectos colaborativos aún.
            </Typography>
          </Card>
        )}
      </Box>

      {/* Botón flotante para crear proyecto */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Modal para crear proyecto */}
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={fetchProjects}
      />

      {/* Modal para editar proyecto */}
      <EditProjectModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onProjectUpdated={handleProjectUpdated}
      />
    </Container>
  );
};

export default Projects;