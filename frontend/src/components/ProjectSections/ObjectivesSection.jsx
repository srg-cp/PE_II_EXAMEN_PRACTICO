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
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
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

  useEffect(() => {
    if (sectionData?.content) {
      try {
        const parsedData = typeof sectionData.content === 'string' 
          ? JSON.parse(sectionData.content) 
          : sectionData.content;

        if (parsedData.strategic) {
          setObjectives(parsedData);
        } else if (Array.isArray(parsedData)) {
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
  }, [sectionData]);

  const handleObjectivesChange = (newObjectives) => {
    setObjectives(newObjectives);
    onDataUpdate({ ...sectionData, content: newObjectives });
  };

  // ... resto de las funciones de manejo de objetivos ...

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

  const addSpecificObjective = (strategicIndex) => {
    const newObjectives = { ...objectives };
    const newId = Math.max(...newObjectives.strategic.flatMap(s => s.specificObjectives.map(o => o.id))) + 1;
    newObjectives.strategic[strategicIndex].specificObjectives.push({
      id: newId,
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending'
    });
    handleObjectivesChange(newObjectives);
  };

  const removeSpecificObjective = (strategicIndex, specificIndex) => {
    const newObjectives = { ...objectives };
    newObjectives.strategic[strategicIndex].specificObjectives.splice(specificIndex, 1);
    handleObjectivesChange(newObjectives);
  };

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Define los objetivos estratégicos y específicos de tu proyecto. Los objetivos estratégicos son metas amplias y de largo plazo, mientras que los específicos son acciones concretas y medibles.
      </Typography>

      {objectives.strategic.map((strategicObj, strategicIndex) => (
        <Accordion
          key={strategicObj.id}
          expanded={expandedAccordion === strategicIndex}
          onChange={() => setExpandedAccordion(expandedAccordion === strategicIndex ? -1 : strategicIndex)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Objetivo Estratégico {strategicIndex + 1}: {strategicObj.title || 'Sin título'}
            </Typography>
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
                  <Card key={specificObj.id} sx={{ mb: 2, p: 2 }}>
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
                          <IconButton
                            color="error"
                            onClick={() => removeSpecificObjective(strategicIndex, specificIndex)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
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
    </Box>
  );
};

export default ObjectivesSection;