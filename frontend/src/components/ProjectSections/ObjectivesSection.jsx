import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const ObjectivesSection = ({ projectId, sectionData, onDataUpdate }) => {
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
  const [expandedAccordion, setExpandedAccordion] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    strategicIndex: null,
    title: ''
  });

  useEffect(() => {
    // Si no hay datos, usar la estructura por defecto (que ya está en useState)
    if (!sectionData?.content || sectionData.content === '' || sectionData.content === '{}') {
      // No hacer nada, mantener la estructura por defecto del useState
      return;
    }

    try {
      const parsedData = typeof sectionData.content === 'string' 
        ? JSON.parse(sectionData.content) 
        : sectionData.content;

      // Verificar si los datos tienen la estructura correcta
      if (parsedData && parsedData.strategic && Array.isArray(parsedData.strategic)) {
        // SOLO completar objetivos si hay MENOS de 1 (nunca debe haber 0)
        const strategicObjectives = [...parsedData.strategic];
        
        // Solo asegurar que haya al menos 1 objetivo estratégico (mínimo absoluto)
        if (strategicObjectives.length === 0) {
          strategicObjectives.push({
            id: 1,
            title: '',
            description: '',
            specificObjectives: [
              { id: 1, title: '', description: '', priority: 'medium', status: 'pending' },
              { id: 2, title: '', description: '', priority: 'medium', status: 'pending' }
            ]
          });
        }

        // Asegurar que cada objetivo estratégico tenga al menos 1 objetivo específico
        strategicObjectives.forEach((strategic, index) => {
          if (!strategic.specificObjectives || !Array.isArray(strategic.specificObjectives)) {
            strategic.specificObjectives = [];
          }
          
          // Solo asegurar que haya al menos 1 objetivo específico (mínimo absoluto)
          if (strategic.specificObjectives.length === 0) {
            const maxId = Math.max(
              0, 
              ...strategicObjectives.flatMap(s => s.specificObjectives?.map(o => o.id) || [])
            );
            strategic.specificObjectives.push({
              id: maxId + 1,
              title: '',
              description: '',
              priority: 'medium',
              status: 'pending'
            });
          }
        });

        setObjectives({ strategic: strategicObjectives });
      } else if (Array.isArray(parsedData)) {
        // Migración de estructura antigua - SOLO crear la estructura mínima
        const migratedData = {
          strategic: parsedData.length > 0 ? parsedData.slice(0, 3).map((obj, index) => ({
            id: index + 1,
            title: obj.title || '',
            description: obj.description || '',
            specificObjectives: [
              { id: index * 2 + 1, title: '', description: '', priority: 'medium', status: 'pending' },
              { id: index * 2 + 2, title: '', description: '', priority: 'medium', status: 'pending' }
            ]
          })) : [{
            id: 1,
            title: '',
            description: '',
            specificObjectives: [
              { id: 1, title: '', description: '', priority: 'medium', status: 'pending' }
            ]
          }]
        };
        
        setObjectives(migratedData);
      } else {
        // Si los datos no tienen la estructura esperada, usar la estructura por defecto
        console.log('Datos de objetivos con estructura no reconocida:', parsedData);
        // No cambiar el estado, mantener la estructura por defecto
      }
    } catch (error) {
      console.error('Error parsing objectives data:', error);
      // En caso de error, mantener la estructura por defecto del useState
    }
  }, [sectionData]);

  const handleObjectivesChange = (newObjectives) => {
    setObjectives(newObjectives);
    onDataUpdate({ ...sectionData, content: newObjectives });
  };

  const handleStrategicObjectiveChange = (index, field, value) => {
    const newObjectives = { ...objectives };
    newObjectives.strategic[index][field] = value;
    handleObjectivesChange(newObjectives);
  };

  const handleSpecificObjectiveChange = (strategicIndex, specificIndex, field, value) => {
    const newObjectives = { ...objectives };
    newObjectives.strategic[strategicIndex].specificObjectives[specificIndex][field] = value;
    handleObjectivesChange(newObjectives);
  };

  const addStrategicObjective = () => {
    const newObjectives = { ...objectives };
    // Generar IDs únicos
    const maxStrategicId = Math.max(...newObjectives.strategic.map(s => s.id));
    const maxSpecificId = Math.max(...newObjectives.strategic.flatMap(s => s.specificObjectives.map(o => o.id)));
    
    const newStrategicId = maxStrategicId + 1;
    newObjectives.strategic.push({
      id: newStrategicId,
      title: '',
      description: '',
      specificObjectives: [
        { id: maxSpecificId + 1, title: '', description: '', priority: 'medium', status: 'pending' },
        { id: maxSpecificId + 2, title: '', description: '', priority: 'medium', status: 'pending' }
      ]
    });
    handleObjectivesChange(newObjectives);
    // Expandir el nuevo objetivo estratégico
    setExpandedAccordion(newObjectives.strategic.length - 1);
  };

  const handleDeleteStrategicObjective = (strategicIndex) => {
    const strategicObj = objectives.strategic[strategicIndex];
    setDeleteDialog({
      open: true,
      strategicIndex,
      title: strategicObj.title || `Objetivo Estratégico ${strategicIndex + 1}`
    });
  };

  const handleCloseDialog = () => {
    setDeleteDialog(prev => ({ ...prev, open: false }));
    
    setTimeout(() => {
      setDeleteDialog({ open: false, strategicIndex: null, title: '' });
    }, 300);
  };

  const confirmDeleteStrategicObjective = () => {
    const { strategicIndex } = deleteDialog;
    const newObjectives = { ...objectives };
    
    // Solo permitir eliminar si quedaría al menos 1 objetivo estratégico
    if (newObjectives.strategic.length <= 1) {
      handleCloseDialog();
      return;
    }
    
    // Eliminar el objetivo estratégico
    newObjectives.strategic.splice(strategicIndex, 1);
    
    handleObjectivesChange(newObjectives);
    
    // Ajustar el accordion expandido
    if (expandedAccordion >= strategicIndex) {
      setExpandedAccordion(Math.max(0, expandedAccordion - 1));
    }
    
    handleCloseDialog();
  };

  const addSpecificObjective = (strategicIndex) => {
    const newObjectives = { ...objectives };
    const maxId = Math.max(...newObjectives.strategic.flatMap(s => s.specificObjectives.map(o => o.id)));
    newObjectives.strategic[strategicIndex].specificObjectives.push({
      id: maxId + 1,
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending'
    });
    handleObjectivesChange(newObjectives);
  };

  const removeSpecificObjective = (strategicIndex, specificIndex) => {
    const newObjectives = { ...objectives };
    // No permitir eliminar si solo hay 1 objetivo específico
    if (newObjectives.strategic[strategicIndex].specificObjectives.length <= 1) {
      return;
    }
    newObjectives.strategic[strategicIndex].specificObjectives.splice(specificIndex, 1);
    handleObjectivesChange(newObjectives);
  };

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Define los objetivos estratégicos y específicos de tu proyecto. Los objetivos estratégicos son metas amplias y de largo plazo, mientras que los específicos son acciones concretas y medibles.
      </Typography>

      {/* Botón para agregar objetivo estratégico */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addStrategicObjective}
          size="medium"
        >
          Agregar Objetivo Estratégico
        </Button>
      </Box>

      {objectives.strategic.map((strategicObj, strategicIndex) => (
        <Accordion
          key={`strategic-${strategicObj.id}-${strategicIndex}`}
          expanded={expandedAccordion === strategicIndex}
          onChange={() => setExpandedAccordion(expandedAccordion === strategicIndex ? -1 : strategicIndex)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              <Typography variant="h6">
                Objetivo Estratégico {strategicIndex + 1}: {strategicObj.title || 'Sin título'}
              </Typography>
              {/* Solo mostrar botón de eliminar si hay más de 3 objetivos estratégicos O si no es el primer objetivo */}
              {objectives.strategic.length > 1 && (
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStrategicObjective(strategicIndex);
                  }}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título del Objetivo Estratégico"
                  value={strategicObj.title}
                  onChange={(e) => handleStrategicObjectiveChange(strategicIndex, 'title', e.target.value)}
                  placeholder="Ej: Mejorar la eficiencia operacional"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  value={strategicObj.description}
                  onChange={(e) => handleStrategicObjectiveChange(strategicIndex, 'description', e.target.value)}
                  placeholder="Describe detalladamente este objetivo estratégico..."
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Objetivos Específicos
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => addSpecificObjective(strategicIndex)}
                    size="small"
                  >
                    Agregar Objetivo Específico
                  </Button>
                </Box>

                {strategicObj.specificObjectives.map((specificObj, specificIndex) => (
                  <Card key={`specific-${specificObj.id}-${strategicIndex}-${specificIndex}`} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Título"
                          value={specificObj.title}
                          onChange={(e) => handleSpecificObjectiveChange(strategicIndex, specificIndex, 'title', e.target.value)}
                          placeholder="Objetivo específico..."
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          label="Descripción"
                          value={specificObj.description}
                          onChange={(e) => handleSpecificObjectiveChange(strategicIndex, specificIndex, 'description', e.target.value)}
                          placeholder="Descripción detallada..."
                        />
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Prioridad</InputLabel>
                          <Select
                            value={specificObj.priority}
                            onChange={(e) => handleSpecificObjectiveChange(strategicIndex, specificIndex, 'priority', e.target.value)}
                            label="Prioridad"
                          >
                            <MenuItem value="high">Alta</MenuItem>
                            <MenuItem value="medium">Media</MenuItem>
                            <MenuItem value="low">Baja</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <Box display="flex" justifyContent="center">
                          {/* Solo mostrar botón de eliminar si hay más de 1 objetivo específico */}
                          {strategicObj.specificObjectives.length > 1 && (
                            <IconButton
                              color="error"
                              onClick={() => removeSpecificObjective(strategicIndex, specificIndex)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Dialog de confirmación para eliminar objetivo estratégico */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <WarningIcon sx={{ color: 'warning.main', fontSize: 28 }} />
            <Typography variant="headlineSmall" fontWeight={600}>
              Eliminar objetivo
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.primary' }}>
            ¿Estás seguro de que quieres eliminar este objetivo estratégico?
          </Typography>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 2, 
              backgroundColor: 'grey.50',
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              {deleteDialog.title ? `${deleteDialog.title} • Ahora` : `Objetivo Estratégico ${(deleteDialog.strategicIndex || 0) + 1} • Ahora`}
            </Typography>
          </Paper>
          
          <Alert 
            severity="warning" 
            sx={{ 
              backgroundColor: 'warning.50',
              '& .MuiAlert-icon': {
                color: 'warning.main'
              }
            }}
          >
            Esta acción eliminará el objetivo y todos sus objetivos específicos asociados de forma permanente.
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDeleteStrategicObjective}
            variant="contained"
            color="error"
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ObjectivesSection;