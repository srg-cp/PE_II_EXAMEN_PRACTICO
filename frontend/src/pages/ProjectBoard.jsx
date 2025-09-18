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
// Agregar imports para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// Agregar import para iconos Material Design
import { Download } from '@mui/icons-material';

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
    // Agregar este useEffect después de los otros useEffect
    useEffect(() => {
      return () => {
        // Limpiar estado de edición al desmontar el componente
        if (editingSection && socket) {
          socket.emit('section-editing', {
            projectId,
            sectionKey: editingSection,
            isEditing: false
          });
        }
      };
    }, [editingSection, socket, projectId]);
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

  // MOVER la función generatePDF AQUÍ DENTRO del componente
  const generatePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;
      
      // Función auxiliar para agregar texto con salto de línea automático
      const addTextWithWrap = (text, x, y, maxWidth, fontSize = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * fontSize * 0.35);
      };
      
      // Función para agregar nueva página si es necesario
      const checkPageBreak = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };
      
      // Título principal
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('RESUMEN EJECUTIVO PLAN ESTRATÉGICO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Información del proyecto
      if (project) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('INFORMACIÓN DEL PROYECTO', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        yPosition = addTextWithWrap(`Nombre: ${project.name}`, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 5;
        
        if (project.description) {
          yPosition = addTextWithWrap(`Descripción: ${project.description}`, margin, yPosition, pageWidth - 2 * margin);
          yPosition += 10;
        }
        
        // Participantes
        if (project.participants && project.participants.length > 0) {
          checkPageBreak(20);
          pdf.setFont(undefined, 'bold');
          yPosition = addTextWithWrap('Participantes:', margin, yPosition, pageWidth - 2 * margin, 12);
          yPosition += 5;
          
          pdf.setFont(undefined, 'normal');
          project.participants.forEach(participant => {
            yPosition = addTextWithWrap(`• ${participant.name || participant.email}`, margin + 5, yPosition, pageWidth - 2 * margin - 5);
            yPosition += 3;
          });
          yPosition += 10;
        }
      }
      
      // Función para limpiar HTML y obtener texto plano
      const cleanHtmlContent = (htmlContent) => {
        if (!htmlContent) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        return tempDiv.textContent || tempDiv.innerText || '';
      };
      
      // Misión
      if (sections.mission) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('MISIÓN', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const missionText = cleanHtmlContent(sections.mission);
        yPosition = addTextWithWrap(missionText, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 15;
      }
      
      // Visión
      if (sections.vision) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('VISIÓN', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const visionText = cleanHtmlContent(sections.vision);
        yPosition = addTextWithWrap(visionText, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 15;
      }
      
      // Objetivos
      if (sections.objectives && sections.objectives.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('OBJETIVOS', margin, yPosition);
        yPosition += 10;
        
        sections.objectives.forEach((objective, index) => {
          checkPageBreak(25);
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          yPosition = addTextWithWrap(`${index + 1}. ${objective.title}`, margin, yPosition, pageWidth - 2 * margin);
          yPosition += 5;
          
          pdf.setFont(undefined, 'normal');
          if (objective.description) {
            yPosition = addTextWithWrap(`Descripción: ${objective.description}`, margin + 5, yPosition, pageWidth - 2 * margin - 5);
            yPosition += 3;
          }
          
          const priorityText = objective.priority === 'high' ? 'Alta' : objective.priority === 'medium' ? 'Media' : 'Baja';
          const statusText = objective.status === 'completed' ? 'Completado' : objective.status === 'in_progress' ? 'En Progreso' : 'Pendiente';
          
          yPosition = addTextWithWrap(`Prioridad: ${priorityText} | Estado: ${statusText}`, margin + 5, yPosition, pageWidth - 2 * margin - 5);
          yPosition += 10;
        });
      }
      
      // Análisis FODA
      const swotCategories = [
        { key: 'strengths', label: 'FORTALEZAS' },
        { key: 'weaknesses', label: 'DEBILIDADES' },
        { key: 'opportunities', label: 'OPORTUNIDADES' },
        { key: 'threats', label: 'AMENAZAS' }
      ];
      
      const hasSwotContent = swotCategories.some(cat => sections.swot[cat.key] && sections.swot[cat.key].length > 0);
      
      if (hasSwotContent) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('ANÁLISIS FODA', margin, yPosition);
        yPosition += 10;
        
        swotCategories.forEach(category => {
          if (sections.swot[category.key] && sections.swot[category.key].length > 0) {
            checkPageBreak(20);
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text(category.label, margin, yPosition);
            yPosition += 8;
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            sections.swot[category.key].forEach(item => {
              if (item.text && item.text.trim()) {
                yPosition = addTextWithWrap(`• ${item.text}`, margin + 5, yPosition, pageWidth - 2 * margin - 5);
                yPosition += 3;
              }
            });
            yPosition += 8;
          }
        });
      }
      
      // Estrategia
      if (sections.strategy) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('IDENTIFICACIÓN DE ESTRATEGIA', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const strategyText = cleanHtmlContent(sections.strategy);
        yPosition = addTextWithWrap(strategyText, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 15;
      }
      
      // Conclusiones
      if (sections.conclusions) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('CONCLUSIONES', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const conclusionsText = cleanHtmlContent(sections.conclusions);
        yPosition = addTextWithWrap(conclusionsText, margin, yPosition, pageWidth - 2 * margin);
      }
      
      // Pie de página con fecha
      const currentDate = new Date().toLocaleDateString('es-ES');
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'italic');
      pdf.text(`Generado el ${currentDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Descargar el PDF
      const fileName = `Resumen_Ejecutivo_${project?.name?.replace(/\s+/g, '_') || 'Plan_Estrategico'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
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
      {/* Componentes de colaboración en tiempo real */}
      <ConnectedUsers projectId={projectId} />
      <ChangeHistoryPanel projectId={projectId} />
      
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {project?.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {project?.description}
          </Typography>
          {/* Botón de descarga PDF con Material Design 3 */}
          <Box sx={{ mt: 3 }}>
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

  
  