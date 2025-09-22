import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  CardMedia
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';

const Projects = () => {
  const { user } = useAuth();
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

  const ProjectCard = ({ project, isOwner }) => (
    <Grid item xs={12} sm={6} md={4} key={project._id}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        {/* Imagen del proyecto */}
        {project.image ? (
          <CardMedia
            component="img"
            height="140"
            image={project.image}
            alt={project.name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.main',
              color: 'white'
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
              {project.name.charAt(0).toUpperCase()}
            </Typography>
          </Box>
        )}
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
              {project.name}
            </Typography>
            <Chip 
              icon={isOwner ? <PersonIcon /> : <GroupIcon />}
              label={isOwner ? 'Owner' : 'Invitado'}
              size="small"
              color={isOwner ? 'primary' : 'secondary'}
              variant="outlined"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {project.description || 'Sin descripción'}
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            Creado: {new Date(project.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            startIcon={<ViewIcon />}
            onClick={() => handleViewProject(project._id)}
            variant="contained"
            size="small"
          >
            Ver Proyecto
          </Button>
          
          {isOwner && (
            <IconButton 
              size="small" 
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditProject(project);
              }}
            >
              <SettingsIcon />
            </IconButton>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

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