import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Fab,
  Avatar,
  Chip,
  Paper,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as FolderIcon,
  Launch as LaunchIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import { useAccessControl } from '../hooks/useAccessControl';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { handleAccessError } = useAccessControl();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    // Verificar que el usuario esté disponible antes de proceder
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('/api/projects', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // El backend ya filtra por acceso, no necesitamos filtrar aquí
      setProjects(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (!handleAccessError(error)) {
        setError('Error al cargar los proyectos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = async (projectId) => {
    try {
      // Verificar acceso antes de navegar
      await axios.get(`/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate(`/project/${projectId}`);
    } catch (error) {
      if (error.response?.status === 403) {
        // Mostrar mensaje y actualizar la lista de proyectos
        setError('Ya no tienes acceso a este proyecto. Se ha actualizado tu lista de proyectos.');
        fetchProjects(); // Refrescar la lista
      } else {
        console.error('Error accessing project:', error);
        setError('Error al acceder al proyecto');
      }
    }
  };

  const handleCreateProject = () => {
    setCreateModalOpen(true);
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // En la sección donde se renderizan las tarjetas de proyecto, agregar:
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Bienvenido, {user?.name}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Gestiona tus proyectos y colabora con tu equipo
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {/* Create New Project Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              border: '2px dashed',
              borderColor: 'primary.light',
              backgroundColor: 'background.paper',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50'
              },
              cursor: 'pointer'
            }}
            onClick={() => setCreateModalOpen(true)}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <AddIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" component="h3" gutterBottom>
                Nuevo Proyecto
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crea un nuevo proyecto para empezar a colaborar
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setCreateModalOpen(true);
                }}
              >
                Crear Proyecto
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Existing Projects */}
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  {project.image ? (
                    <Avatar 
                      src={project.image}
                      sx={{ 
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    />
                  ) : (
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" noWrap>
                      {project.name}
                    </Typography>
                    <Chip 
                      icon={<FolderIcon />}
                      label="Proyecto"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  {/* Botón de edición - solo visible para el owner */}
                  {project.owner && project.owner._id === user?._id && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'primary.50'
                        }
                      }}
                    >
                      <SettingsIcon />
                    </IconButton>
                  )}
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
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => navigate(`/document/${project._id}`)}
                >
                  Documentos
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<LaunchIcon />}
                  component={Link}
                  to={`/project/${project._id}`}
                >
                  Ver Proyecto
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {projects.length === 0 && !loading && (
        <Paper 
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            mt: 4,
            backgroundColor: 'background.paper'
          }}
        >
          <Avatar sx={{ mx: 'auto', mb: 3, bgcolor: 'grey.300', width: 80, height: 80 }}>
            <FolderIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" component="h3" gutterBottom>
            No hay proyectos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Comienza creando tu primer proyecto para organizar tu trabajo.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            Crear Primer Proyecto
          </Button>
        </Paper>
      )}

      {/* Botón flotante para crear proyecto */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Modal de crear proyecto */}
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      
    {/* Modal de editar proyecto */}
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

export default Dashboard;
