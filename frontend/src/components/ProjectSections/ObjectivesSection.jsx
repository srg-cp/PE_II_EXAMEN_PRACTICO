import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  Avatar,
  Grid,
  Paper,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const ObjectivesSection = ({ projectId, sectionData, onDataUpdate, user, project }) => {
  const [objectives, setObjectives] = useState({
    strategic: [
      {
        id: 1,
        title: '',
        description: '',
        specificObjectives: [
          { id: 1, title: '', description: '', priority: 'medium', status: 'pending' },
          { id: 2, title: '', description: '', priority: 'medium', status: 'pending' }
        ]
      },
      {
        id: 2,
        title: '',
        description: '',
        specificObjectives: [
          { id: 3, title: '', description: '', priority: 'medium', status: 'pending' },
          { id: 4, title: '', description: '', priority: 'medium', status: 'pending' }
        ]
      },
      {
        id: 3,
        title: '',
        description: '',
        specificObjectives: [
          { id: 5, title: '', description: '', priority: 'medium', status: 'pending' },
          { id: 6, title: '', description: '', priority: 'medium', status: 'pending' }
        ]
      }
    ]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastModified, setLastModified] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(0);

  useEffect(() => {
    if (sectionData?.content) {
      try {
        // Migrar datos antiguos si es necesario
        const parsedData = typeof sectionData.content === 'string' 
          ? JSON.parse(sectionData.content) 
          : sectionData.content;

        if (parsedData.strategic) {
          setObjectives(parsedData);
        } else if (Array.isArray(parsedData)) {
          // Migrar estructura antigua
          const migratedData = {
            strategic: parsedData.slice(0, 3).map((obj, index) => ({
              id: index + 1,
              title: obj.title || '',
              description: obj.description || '',
              specificObjectives: [
                { id: index * 2 + 1, title: '', description: '', priority: 'medium', status: 'pending' },
                { id: index * 2 + 2, title: '', description: '', priority: 'medium', status: 'pending' }
              ]
            }))
          };
          setObjectives(migratedData);
        }
      } catch (error) {
        console.error('Error parsing objectives data:', error);
      }
    }
    
    if (sectionData?.lastModified) {
      setLastModified(new Date(sectionData.lastModified));
    }
  }, [sectionData]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const response = await axios.put(
        `/api/projects/${projectId}/sections`,
        {
          sectionKey: 'objectives',
          content: JSON.stringify(objectives),
          lastModified: new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setLastModified(new Date());
      setIsEditing(false);
      
      if (onDataUpdate) {
        onDataUpdate({
          content: JSON.stringify(objectives),
          lastModified: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving objectives:', error);
      setError('Error al guardar los objetivos. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (sectionData?.content) {
      try {
        const parsedData = typeof sectionData.content === 'string' 
          ? JSON.parse(sectionData.content) 
          : sectionData.content;
        setObjectives(parsedData);
      } catch (error) {
        console.error('Error restoring objectives data:', error);
      }
    }
    setIsEditing(false);
    setError('');
  };

  // Funciones para manejar objetivos estratégicos
  const addStrategicObjective = () => {
    const newId = Math.max(...objectives.strategic.map(obj => obj.id), 0) + 1;
    const newStrategicObjective = {
      id: newId,
      title: '',
      description: '',
      specificObjectives: [
        { id: Date.now(), title: '', description: '', priority: 'medium', status: 'pending' },
        { id: Date.now() + 1, title: '', description: '', priority: 'medium', status: 'pending' }
      ]
    };
    setObjectives(prev => ({
      ...prev,
      strategic: [...prev.strategic, newStrategicObjective]
    }));
  };

  const updateStrategicObjective = (strategicId, field, value) => {
    setObjectives(prev => ({
      ...prev,
      strategic: prev.strategic.map(strategic => 
        strategic.id === strategicId ? { ...strategic, [field]: value } : strategic
      )
    }));
  };

  const removeStrategicObjective = (strategicId) => {
    setObjectives(prev => ({
      ...prev,
      strategic: prev.strategic.filter(strategic => strategic.id !== strategicId)
    }));
  };

  const addSpecificObjective = (strategicId) => {
    const newSpecificObjective = {
      id: Date.now(),
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending'
    };
    setObjectives(prev => ({
      ...prev,
      strategic: prev.strategic.map(strategic => 
        strategic.id === strategicId 
          ? { ...strategic, specificObjectives: [...strategic.specificObjectives, newSpecificObjective] }
          : strategic
      )
    }));
  };

  const updateSpecificObjective = (strategicId, specificId, field, value) => {
    setObjectives(prev => ({
      ...prev,
      strategic: prev.strategic.map(strategic => 
        strategic.id === strategicId 
          ? {
              ...strategic,
              specificObjectives: strategic.specificObjectives.map(specific =>
                specific.id === specificId ? { ...specific, [field]: value } : specific
              )
            }
          : strategic
      )
    }));
  };

  const removeSpecificObjective = (strategicId, specificId) => {
    setObjectives(prev => ({
      ...prev,
      strategic: prev.strategic.map(strategic => 
        strategic.id === strategicId 
          ? {
              ...strategic,
              specificObjectives: strategic.specificObjectives.filter(specific => specific.id !== specificId)
            }
          : strategic
      )
    }));
  };

  // Validaciones
  const validateObjectives = () => {
    const strategic = objectives.strategic || [];
    const errors = [];

    if (strategic.length < 3) {
      errors.push('Se requieren al menos 3 objetivos estratégicos');
    }

    strategic.forEach((strategicObj, index) => {
      if (strategicObj.specificObjectives.length < 2) {
        errors.push(`El objetivo estratégico ${index + 1} debe tener al menos 2 objetivos específicos`);
      }
    });

    return errors;
  };

  const validationErrors = validateObjectives();
  const hasChanges = JSON.stringify(objectives) !== (sectionData?.content || '{}');

  return (
    <Box>
      {/* Header con información y controles */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Objetivos Estratégicos del Proyecto"
          subheader={
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Estructura requerida: Mínimo 3 objetivos estratégicos, cada uno con al menos 2 objetivos específicos
              </Typography>
              {lastModified && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Última modificación: {lastModified.toLocaleString()}
                  </Typography>
                  {user && (
                    <Avatar sx={{ width: 20, height: 20 }}>
                      {user.name?.charAt(0)}
                    </Avatar>
                  )}
                </Box>
              )}
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || validationErrors.length > 0}
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Box>
          }
        />
      </Card>

      {/* Mostrar errores */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Mostrar errores de validación */}
      {validationErrors.length > 0 && isEditing && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Requisitos pendientes:</Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Botón para agregar objetivo estratégico */}
      {isEditing && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addStrategicObjective}
            size="large"
          >
            Agregar Objetivo Estratégico
          </Button>
        </Box>
      )}

      {/* Objetivos Estratégicos */}
      <Grid container spacing={3}>
        {objectives.strategic?.map((strategicObjective, strategicIndex) => (
          <Grid item xs={12} key={strategicObjective.id}>
            <Accordion 
              expanded={expandedAccordion === strategicIndex}
              onChange={() => setExpandedAccordion(expandedAccordion === strategicIndex ? -1 : strategicIndex)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Chip 
                    label={`Estratégico ${strategicIndex + 1}`} 
                    color="primary" 
                    size="small" 
                  />
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {strategicObjective.title || `Objetivo Estratégico ${strategicIndex + 1}`}
                  </Typography>
                  <Chip 
                    label={`${strategicObjective.specificObjectives?.length || 0} específicos`}
                    size="small"
                    color={strategicObjective.specificObjectives?.length >= 2 ? 'success' : 'warning'}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ p: 2 }}>
                  {/* Título y descripción del objetivo estratégico */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                      <TextField
                        label="Título del Objetivo Estratégico"
                        value={strategicObjective.title}
                        onChange={(e) => updateStrategicObjective(strategicObjective.id, 'title', e.target.value)}
                        sx={{ flex: 1 }}
                        required
                        disabled={!isEditing}
                      />
                      {isEditing && (
                        <IconButton 
                          color="error" 
                          onClick={() => removeStrategicObjective(strategicObjective.id)}
                          disabled={objectives.strategic.length <= 3}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    <TextField
                      label="Descripción del Objetivo Estratégico"
                      multiline
                      rows={2}
                      value={strategicObjective.description}
                      onChange={(e) => updateStrategicObjective(strategicObjective.id, 'description', e.target.value)}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Objetivos Específicos */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" color="primary">
                        Objetivos Específicos
                      </Typography>
                      {isEditing && (
                        <Button 
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => addSpecificObjective(strategicObjective.id)}
                        >
                          Agregar Específico
                        </Button>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      {strategicObjective.specificObjectives?.map((specificObjective, specificIndex) => (
                        <Grid item xs={12} md={6} key={specificObjective.id}>
                          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" color="primary">
                                Específico {specificIndex + 1}
                              </Typography>
                              {isEditing && (
                                <IconButton 
                                  size="small"
                                  color="error" 
                                  onClick={() => removeSpecificObjective(strategicObjective.id, specificObjective.id)}
                                  disabled={strategicObjective.specificObjectives.length <= 2}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            
                            <TextField
                              label="Título"
                              value={specificObjective.title}
                              onChange={(e) => updateSpecificObjective(strategicObjective.id, specificObjective.id, 'title', e.target.value)}
                              fullWidth
                              size="small"
                              required
                              disabled={!isEditing}
                              sx={{ mb: 2 }}
                            />
                            
                            <TextField
                              label="Descripción"
                              multiline
                              rows={2}
                              value={specificObjective.description}
                              onChange={(e) => updateSpecificObjective(strategicObjective.id, specificObjective.id, 'description', e.target.value)}
                              fullWidth
                              size="small"
                              disabled={!isEditing}
                              sx={{ mb: 2 }}
                            />
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <FormControl size="small" sx={{ minWidth: 100 }}>
                                <InputLabel>Prioridad</InputLabel>
                                <Select
                                  value={specificObjective.priority}
                                  onChange={(e) => updateSpecificObjective(strategicObjective.id, specificObjective.id, 'priority', e.target.value)}
                                  disabled={!isEditing}
                                >
                                  <MenuItem value="high">Alta</MenuItem>
                                  <MenuItem value="medium">Media</MenuItem>
                                  <MenuItem value="low">Baja</MenuItem>
                                </Select>
                              </FormControl>
                              
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                  value={specificObjective.status}
                                  onChange={(e) => updateSpecificObjective(strategicObjective.id, specificObjective.id, 'status', e.target.value)}
                                  disabled={!isEditing}
                                >
                                  <MenuItem value="pending">Pendiente</MenuItem>
                                  <MenuItem value="in_progress">En Progreso</MenuItem>
                                  <MenuItem value="completed">Completado</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      {/* Indicador de cambios */}
      {hasChanges && isEditing && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Tienes cambios sin guardar. No olvides hacer clic en "Guardar" para conservar tus modificaciones.
        </Alert>
      )}
    </Box>
  );
};

export default ObjectivesSection;