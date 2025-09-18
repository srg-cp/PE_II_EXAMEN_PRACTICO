import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Container,
  Paper,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assignment as MissionIcon,
  Visibility as VisionIcon,
  TrendingUp as ObjectivesIcon,
  Analytics as FodaIcon,
  Strategy as StrategyIcon,
  Summarize as ConclusionsIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Importar los componentes de cada sección
import MissionSection from './ProjectSections/MissionSection';
import VisionSection from './ProjectSections/VisionSection';
import ObjectivesSection from './ProjectSections/ObjectivesSection';
import FodaSection from './ProjectSections/FodaSection';
import StrategySection from './ProjectSections/StrategySection';
import ConclusionsSection from './ProjectSections/ConclusionsSection';

const ProjectView = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [projectData, setProjectData] = useState({
    mission: { content: '', versions: [] },
    vision: { content: '', versions: [] },
    objectives: { content: '', versions: [] },
    foda: { content: '', versions: [] },
    strategy: { content: '', versions: [] },
    conclusions: { content: '', versions: [] }
  });

  const sections = [
    {
      id: 'mission',
      label: 'Misión',
      icon: <MissionIcon />,
      component: MissionSection
    },
    {
      id: 'vision',
      label: 'Visión',
      icon: <VisionIcon />,
      component: VisionSection
    },
    {
      id: 'objectives',
      label: 'Objetivos Estratégicos',
      icon: <ObjectivesIcon />,
      component: ObjectivesSection
    },
    {
      id: 'foda',
      label: 'Análisis FODA',
      icon: <FodaIcon />,
      component: FodaSection
    },
    {
      id: 'strategy',
      label: 'Identificación de Estrategia',
      icon: <StrategyIcon />,
      component: StrategySection
    },
    {
      id: 'conclusions',
      label: 'Conclusiones',
      icon: <ConclusionsIcon />,
      component: ConclusionsSection
    }
  ];

  useEffect(() => {
    fetchProject();
    fetchProjectData();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/sections`);
      setProjectData(response.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const updateSectionData = (sectionId, newData) => {
    setProjectData(prev => ({
      ...prev,
      [sectionId]: newData
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Cargando proyecto...</Typography>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Proyecto no encontrado</Typography>
      </Container>
    );
  }

  const ActiveComponent = sections[activeTab].component;
  const activeSection = sections[activeTab];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header del proyecto */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {project.image && (
            <Avatar
              src={project.image}
              sx={{ width: 60, height: 60 }}
            >
              {project.name.charAt(0)}
            </Avatar>
          )}
          <Box flex={1}>
            <Typography variant="h4" component="h1" gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {project.description}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Chip
                label={project.status === 'active' ? 'Activo' : 'Borrador'}
                color={project.status === 'active' ? 'success' : 'default'}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                Propietario: {project.owner?.name}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Navegación por pestañas */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {sections.map((section, index) => (
            <Tab
              key={section.id}
              icon={section.icon}
              label={section.label}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Contenido de la sección activa */}
      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" component="h2">
                {activeSection.label}
              </Typography>
              <Tooltip title="Ver historial de versiones">
                <IconButton>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <ActiveComponent
              projectId={projectId}
              sectionData={projectData[activeSection.id]}
              onDataUpdate={(newData) => updateSectionData(activeSection.id, newData)}
              user={user}
              project={project}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProjectView;