import React, { useState, useEffect, useRef } from 'react';
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
  Tooltip,
  Button
} from '@mui/material';
import {
  Assignment as MissionIcon,
  Visibility as VisionIcon,
  TrendingUp as ObjectivesIcon,
  AccountTree as StrategyIcon,
  Summarize as ConclusionsIcon,
  Assessment as ValueChainIcon,
  History as HistoryIcon,
  Download,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useAccessControl } from '../hooks/useAccessControl';
import axios from 'axios';

// Importar los componentes de cada sección
import MissionSection from './ProjectSections/MissionSection';
import VisionSection from './ProjectSections/VisionSection';
import ObjectivesSection from './ProjectSections/ObjectivesSection';
import StrategySection from './ProjectSections/StrategySection';
import ConclusionsSection from './ProjectSections/ConclusionsSection';
import ValueChainDiagnosticSection from './ProjectSections/ValueChainDiagnosticSection';

// Importar componentes adicionales
import ConnectedUsersHeader from './ConnectedUsers/ConnectedUsersHeader';
import ChangeHistoryPanel from './ChangeHistory/ChangeHistoryPanel';
import AccessDenied from './Error/AccessDenied';
import { exportProjectToPDF } from '../utils/pdfExport';

const ProjectView = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { socket, joinProject, leaveProject } = useSocket();
  const { accessDenied, accessError, handleAccessError } = useAccessControl();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editingSection, setEditingSection] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);
  // Mantener la estructura original que esperan los componentes
  const [projectData, setProjectData] = useState({
    mission: { content: '', versions: [] },
    vision: { content: '', versions: [] },
    objectives: { content: '', versions: [] },
    strategy: { content: '', versions: [] },
    conclusions: { content: '', versions: [] },
    valueChainDiagnostic: { content: '', versions: [] }
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
      id: 'valueChainDiagnostic',
      label: 'Autodiagnóstico Cadena de Valor',
      icon: <ValueChainIcon />,
      component: ValueChainDiagnosticSection
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

  // Socket.io setup para colaboración en tiempo real
  useEffect(() => {
    if (socket && projectId && !accessDenied) {
      // Unirse al proyecto
      joinProject(projectId);

      // Escuchar actualizaciones de secciones en tiempo real
      socket.on('project-section-updated', (data) => {
        const { sectionKey, content, updatedBy } = data;
        setProjectData(prev => ({
          ...prev,
          [sectionKey]: { ...prev[sectionKey], content }
        }));
      });

      return () => {
        socket.off('project-section-updated');
        leaveProject(projectId);
      };
    }
  }, [socket, projectId, joinProject, leaveProject, accessDenied]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      if (!handleAccessError(error)) {
        console.error('Error no relacionado con acceso:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}/sections`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data) {
        const formattedData = {};
        Object.keys(response.data).forEach(key => {
          formattedData[key] = {
            content: response.data[key] || '',
            versions: []
          };
        });
        setProjectData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      if (!handleAccessError(error)) {
        console.error('Error no relacionado con acceso:', error);
      }
    }
  };

  // Verificar si hay error de acceso
  if (accessDenied) {
    return (
      <AccessDenied
        title={accessError?.title}
        message={accessError?.message}
      />
    );
  }

  const handleTabChange = (event, newValue) => {
    // Limpiar el estado de edición antes de cambiar de tab
    if (editingSection && socket) {
      socket.emit('section-editing', {
        projectId,
        sectionKey: editingSection,
        isEditing: false
      });
    }
    setEditingSection(null);
    setActiveTab(newValue);
  };

  // Función para guardar contenido con debounce
  const saveContent = async (sectionId, contentToSave) => {
    try {
      // Convertir de vuelta al formato que espera el backend
      const sectionsForBackend = {};
      Object.keys(projectData).forEach(key => {
        if (key === sectionId) {
          sectionsForBackend[key] = contentToSave;
        } else {
          sectionsForBackend[key] = projectData[key].content;
        }
      });

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}/sections`,
        { sections: sectionsForBackend },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
    }
  };

  const updateSectionData = (sectionId, newData) => {
    setProjectData(prev => ({
      ...prev,
      [sectionId]: newData
    }));

    // Emitir cambio via Socket.io para colaboración en tiempo real
    if (socket) {
      socket.emit('project-section-update', {
        projectId,
        sectionKey: sectionId,
        content: newData.content,
        changeType: 'edit'
      });
    }

    // Auto-guardar con debounce
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveContent(sectionId, newData.content);
    }, 2000); // Guardar después de 2 segundos de inactividad
  };

  // Función para obtener el icono del estado de guardado
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

  // Función para generar PDF del resumen ejecutivo
  const generatePDF = async () => {
    try {
      // Preparar los datos del proyecto en el formato correcto
      const projectDataForPDF = {
        name: project?.name || 'Proyecto Sin Título',
        description: project?.description || '',
        image: project?.image || '',
        status: project?.status || 'draft',
        timeline: project?.timeline || {},
        sections: {
          mission: projectData.mission?.content || '',
          vision: projectData.vision?.content || '',
          objectives: projectData.objectives?.content || [],
          strategy: projectData.strategy?.content || '',
          conclusions: projectData.conclusions?.content || ''
        },
        documents: project?.documents || []
      };

      // Usar la función mejorada de exportación
      const result = await exportProjectToPDF(projectDataForPDF);
      
      if (result.success) {
        console.log('PDF generado exitosamente:', result.fileName);
      } else {
        console.error('Error generando PDF:', result.error);
        alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
      }
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, mb: 4, px: 2 }}>
        <Typography>Cargando proyecto...</Typography>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ mt: 4, mb: 4, px: 2 }}>
        <Typography>Proyecto no encontrado</Typography>
      </Box>
    );
  }

  const ActiveComponent = sections[activeTab].component;
  const activeSection = sections[activeTab];

  return (
    <>
      {/* Panel de historial de cambios */}
      <ChangeHistoryPanel projectId={projectId} />
      
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header del proyecto */}
        <Box sx={{ p: 3, mb: 3 }}>
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

          {/* Contenedor para botón PDF y colaboradores activos */}
          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 3,
            flexWrap: 'wrap'
          }}>
            {/* Botón de descarga PDF */}
            <Button 
              variant="contained" 
              startIcon={<Download />}
              onClick={generatePDF}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1.5,
                backgroundColor: 'primary.main',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15), 0px 1px 4px rgba(0, 0, 0, 0.3)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)'
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Descargar Resumen Ejecutivo PDF
            </Button>
            
            {/* Colaboradores activos */}
            <ConnectedUsersHeader projectId={projectId} inline={true} />
          </Box>
        </Box>

        {/* Navegación por pestañas */}
        <Box sx={{ mb: 3, px: 2 }}>
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
        </Box>

        {/* Contenido de la sección activa */}
        <Box sx={{ px: 2 }}>
          <Card elevation={2}>
            <CardContent sx={{ p: 0 }}>
              <Box p={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" component="h2">
                    {activeSection.label}
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

                    {/* Historial de versiones */}
                    <Tooltip title="Ver historial de versiones">
                      <IconButton>
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <ActiveComponent
                  projectId={projectId}
                  sectionKey={activeSection.id}
                  sectionData={projectData[activeSection.id]}
                  onDataUpdate={(newData) => updateSectionData(activeSection.id, newData)}
                  user={user}
                  project={project}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default ProjectView;