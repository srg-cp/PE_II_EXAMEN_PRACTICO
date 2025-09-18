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
import ChangeHistory from '../components/ChangeHistory/ChangeHistory';

const ProjectBoard = () => {
  // Cambiar projectId por id para que coincida con la ruta
  const { id: projectId } = useParams();
  const { socket, joinProject, leaveProject } = useSocket();
  const [project, setProject] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
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
    if (socket && projectId) {
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
  }, [socket, projectId, joinProject, leaveProject]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
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
    if (editingSection && socket) {
      socket.emit('section-editing', {
        projectId,
        sectionKey: editingSection,
        isEditing: false
      });
    }
    setEditingSection(null);
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

  const renderMissionVision = (sectionKey) => (
    <Paper sx={{ p: 3, mt: 2 }}>
      <ReactQuill
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
        theme="snow"
        value={sections[sectionKey]}
        onChange={(value) => updateSection(sectionKey, value)}
        onFocus={() => handleSectionFocus(sectionKey)}
        onBlur={handleSectionBlur}
        placeholder={`Describe la ${sectionKey === 'strategy' ? 'estrategia' : 'conclusiones'} del proyecto...`}
        style={{ minHeight: '300px' }}
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

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Cargando proyecto...</Typography>
      </Container>
    );
  }

  return (
    <>
      {/* Componentes de colaboración en tiempo real */}
      <ConnectedUsers projectId={projectId} />
      <ChangeHistory projectId={projectId} />
      
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {project?.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {project?.description}
          </Typography>
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