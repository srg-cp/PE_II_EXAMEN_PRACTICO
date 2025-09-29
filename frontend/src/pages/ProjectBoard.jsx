import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSocket } from '../contexts/SocketContext';
import ConnectedUsers from '../components/ConnectedUsers/ConnectedUsers';
import ChangeHistoryPanel from '../components/ChangeHistory/ChangeHistoryPanel';
// Importar la función mejorada de PDF
import { exportProjectToPDF } from '../utils/pdfExport';
// Agregar import para iconos Material Design
import { Download } from '@mui/icons-material';
import ConnectedUsersHeader from '../components/ConnectedUsers/ConnectedUsersHeader';
import AccessDenied from '../components/Error/AccessDenied';
import { useAccessControl } from '../hooks/useAccessControl';

const ProjectBoard = () => {
  // Cambiar projectId por id para que coincida con la ruta
  const { id: projectId } = useParams();
  const { socket, joinProject, leaveProject } = useSocket();
  const [project, setProject] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const { accessDenied, accessError, handleAccessError } = useAccessControl();
  const [sections, setSections] = useState({
    mission: '',
    vision: '',
    objectives: [],
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    },
    strategy: '',
    conclusions: ''
  });

  const tabs = [
    { label: 'Misión', key: 'mission' },
    { label: 'Visión', key: 'vision' },
    { label: 'Objetivos', key: 'objectives' },
    { label: 'FODA', key: 'swot' },
    { label: 'Identificacion de Estrategia', key: 'strategy' },
    { label: 'Conclusiones', key: 'conclusions' }
  ];

  useEffect(() => {
    fetchProject();
    fetchProjectSections();
  }, [projectId]);

  // Socket.io setup
  useEffect(() => {
    if (socket && projectId && !accessDenied) {
      // Unirse al proyecto
      joinProject(projectId);

      // Escuchar actualizaciones de secciones en tiempo real
      socket.on('project-section-updated', (data) => {
        const { sectionKey, content, updatedBy } = data;
        setSections(prev => ({
          ...prev,
          [sectionKey]: content
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
    }
  };

  const fetchProjectSections = async () => {
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
        setSections(response.data);
      }
    } catch (error) {
      console.error('Error fetching project sections:', error);
      if (!handleAccessError(error)) {
        console.error('Error no relacionado con acceso:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // error de acceso, mostrar el componente AccessDenied
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
    setCurrentTab(newValue);
  };

  const updateSection = async (sectionKey, value) => {
    try {
      const updatedSections = { ...sections, [sectionKey]: value };
      setSections(updatedSections);
      
      // Emitir cambio via Socket.io para colaboración en tiempo real
      if (socket) {
        socket.emit('project-section-update', {
          projectId,
          sectionKey,
          content: value,
          changeType: 'edit'
        });
      }
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}/sections`,
        { sections: updatedSections },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
    } catch (error) {
      console.error('Error updating section:', error);
      if (handleAccessError(error)) {
        // error 403 se maneja automatico
        return;
      }
      // para manerja otros errores aquí
    }
  };

  const handleSectionFocus = (sectionKey) => {
    setEditingSection(sectionKey);
    if (socket) {
      socket.emit('section-editing', {
        projectId,
        sectionKey,
        isEditing: true
      });
    }
  };

  const handleSectionBlur = () => {
    setEditingSection(null);
    if (socket) {
      socket.emit('section-editing', {
        projectId,
        sectionKey: editingSection,
        isEditing: false
      });
    }
  };

  const addObjective = () => {
    const newObjective = {
      id: Date.now(),
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending'
    };
    const updatedObjectives = [...sections.objectives, newObjective];
    updateSection('objectives', updatedObjectives);
  };

  const updateObjective = (id, field, value) => {
    const updatedObjectives = sections.objectives.map(obj => 
      obj.id === id ? { ...obj, [field]: value } : obj
    );
    updateSection('objectives', updatedObjectives);
  };

  const removeObjective = (id) => {
    const updatedObjectives = sections.objectives.filter(obj => obj.id !== id);
    updateSection('objectives', updatedObjectives);
  };

  const addSwotItem = (category) => {
    const newItem = {
      id: Date.now(),
      text: ''
    };
    const updatedSwot = {
      ...sections.swot,
      [category]: [...sections.swot[category], newItem]
    };
    updateSection('swot', updatedSwot);
  };

  const updateSwotItem = (category, id, value) => {
    const updatedItems = sections.swot[category].map(item => 
      item.id === id ? { ...item, text: value } : item
    );
    const updatedSwot = {
      ...sections.swot,
      [category]: updatedItems
    };
    updateSection('swot', updatedSwot);
  };

  const removeSwotItem = (category, id) => {
    const updatedItems = sections.swot[category].filter(item => item.id !== id);
    const updatedSwot = {
      ...sections.swot,
      [category]: updatedItems
    };
    updateSection('swot', updatedSwot);
  };

  const renderMissionVision = (sectionKey) => {
    console.log('renderMissionVision sectionKey:', sectionKey); // Puedes quitar este debug después
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <ReactQuill
          key={sectionKey}
          theme="snow"
          value={sections[sectionKey]}
          onChange={(value) => updateSection(sectionKey, value)}
          onFocus={() => handleSectionFocus(sectionKey)}
          onBlur={handleSectionBlur}
          placeholder={`Describe la ${sectionKey === 'mission' ? 'misión' : 'visión'} del proyecto...`}
          style={{ minHeight: '200px' }}
          modules={{
            toolbar: [
              [{ 'header': [1, 2, false] }],
              ['bold', 'italic', 'underline'],
              ['link'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['clean']
            ]
          }}
        />
      </Paper>
    );
  };

  const renderObjectives = () => (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Objetivos del Proyecto</Typography>
        <Button variant="outlined" onClick={addObjective}>
          Agregar Objetivo
        </Button>
      </Box>
      {sections.objectives.map((objective) => (
        <Box key={objective.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Título"
              value={objective.title}
              onChange={(e) => updateObjective(objective.id, 'title', e.target.value)}
              onFocus={() => handleSectionFocus('objectives')}
              onBlur={handleSectionBlur}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={objective.priority}
                onChange={(e) => updateObjective(objective.id, 'priority', e.target.value)}
              >
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="low">Baja</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={objective.status}
                onChange={(e) => updateObjective(objective.id, 'status', e.target.value)}
              >
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="in_progress">En Progreso</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
              </Select>
            </FormControl>
            <Button color="error" onClick={() => removeObjective(objective.id)}>
              Eliminar
            </Button>
          </Box>
          <TextField
            label="Descripción"
            multiline
            rows={3}
            value={objective.description}
            onChange={(e) => updateObjective(objective.id, 'description', e.target.value)}
            onFocus={() => handleSectionFocus('objectives')}
            onBlur={handleSectionBlur}
            fullWidth
          />
        </Box>
      ))}
    </Paper>
  );

  const renderSwot = () => {
    const swotCategories = [
      { key: 'strengths', label: 'Fortalezas', color: '#4caf50' },
      { key: 'weaknesses', label: 'Debilidades', color: '#f44336' },
      { key: 'opportunities', label: 'Oportunidades', color: '#2196f3' },
      { key: 'threats', label: 'Amenazas', color: '#ff9800' }
    ];

    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>Análisis FODA</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {swotCategories.map((category) => (
            <Box key={category.key} sx={{ border: `2px solid ${category.color}`, borderRadius: 2, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: category.color }}>
                  {category.label}
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => addSwotItem(category.key)}
                  sx={{ color: category.color }}
                >
                  Agregar
                </Button>
              </Box>
              {sections.swot[category.key].map((item) => (
                <Box key={item.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    value={item.text}
                    onChange={(e) => updateSwotItem(category.key, item.id, e.target.value)}
                    onFocus={() => handleSectionFocus('swot')}
                    onBlur={handleSectionBlur}
                    placeholder={`Agregar ${category.label.toLowerCase()}...`}
                    sx={{ flex: 1 }}
                  />
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => removeSwotItem(category.key, item.id)}
                  >
                    ×
                  </Button>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  const renderStrategyConclusions = (sectionKey) => (
    <Paper sx={{ p: 3, mt: 2 }}>
      <ReactQuill
        key={sectionKey}
        theme="snow"
        value={sections[sectionKey]}
        onChange={(value) => updateSection(sectionKey, value)}
        onFocus={() => handleSectionFocus(sectionKey)}
        onBlur={handleSectionBlur}
        placeholder={`Describe ${sectionKey === 'strategy' ? 'la estrategia' : 'las conclusiones'} del proyecto...`}
        style={{ minHeight: '300px' }}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['link'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
          ]
        }}
      />
    </Paper>
  );

  const renderTabContent = () => {
    const currentTabKey = tabs[currentTab].key;
    
    switch (currentTabKey) {
      case 'mission':
      case 'vision':
        return renderMissionVision(currentTabKey);
      case 'objectives':
        return renderObjectives();
      case 'swot':
        return renderSwot();
      case 'strategy':
      case 'conclusions':
        return renderStrategyConclusions(currentTabKey);
      default:
        return null;
    }
  };

  // Reemplazar la función generatePDF con la función mejorada
  const generatePDF = async () => {
    try {
      // Preparar los datos del proyecto en el formato correcto
      const projectData = {
        name: project?.name || 'Proyecto Sin Título',
        description: project?.description || '',
        image: project?.image || '', // Incluir la imagen del proyecto
        status: project?.status || 'draft',
        timeline: project?.timeline || {},
        sections: {
          mission: sections.mission,
          vision: sections.vision,
          objectives: sections.objectives,
          swot: sections.swot,
          strategy: sections.strategy,
          conclusions: sections.conclusions
        },
        documents: project?.documents || []
      };

      // Usar la función mejorada de exportación
      const result = await exportProjectToPDF(projectData);
      
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
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Cargando proyecto...</Typography>
      </Container>
    );
  }

  return (
    <>
      {/* Mantener el componente existente para otras funcionalidades */}
      <ChangeHistoryPanel projectId={projectId} />
      
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {project?.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {project?.description}
          </Typography>
          
          {/* Contenedor para botón PDF (izquierda) y colaboradores activos (extremo derecho) */}
          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', // Esto separa los elementos a extremos opuestos
            gap: 3,
            flexWrap: 'wrap'
          }}>
            {/* Botón de descarga PDF - extremo izquierdo */}
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
            
            {/* Colaboradores activos - extremo derecho */}
            <ConnectedUsersHeader projectId={projectId} inline={true} />
          </Box>
        </Box>

        <Box>
          <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            {tabs.map((tab, index) => (
              <Tab key={tab.key} label={tab.label} />
            ))}
          </Tabs>
          
          {renderTabContent()}
        </Box>
      </Container>
    </>
  );
};

export default ProjectBoard;

  
  