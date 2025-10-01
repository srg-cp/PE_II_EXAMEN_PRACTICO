import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const ValueChainDiagnosticSection = ({ projectId, sectionData, onDataUpdate }) => {
  const theme = useTheme();
  
  // Datos del diagnóstico basados en la imagen proporcionada
  const diagnosticItems = [
    {
      id: 1,
      category: 'Producción y Operaciones',
      text: 'La empresa tiene una política sistematizada de cero defectos en la producción de productos/servicios.',
      icon: '🏭'
    },
    {
      id: 2,
      category: 'Tecnología',
      text: 'La empresa emplea los medios productivos tecnológicamente más avanzados de su sector.',
      icon: '⚙️'
    },
    {
      id: 3,
      category: 'Sistemas de Información',
      text: 'La empresa dispone de un sistema de información y control de gestión eficiente y eficaz.',
      icon: '💻'
    },
    {
      id: 4,
      category: 'Competitividad',
      text: 'Los medios técnicos y tecnológicos de la empresa están preparados para competir en un futuro a corto, medio y largo plazo.',
      icon: '🚀'
    },
    {
      id: 5,
      category: 'I+D+i',
      text: 'La empresa es un referente en su sector en I+D+i.',
      icon: '🔬'
    },
    {
      id: 6,
      category: 'Calidad y Certificaciones',
      text: 'La excelencia de los procedimientos de la empresa (en ISO, etc.) son una principal fuente de ventaja competitiva.',
      icon: '🏆'
    },
    {
      id: 7,
      category: 'Marketing Digital',
      text: 'La empresa dispone de página web, y esta se emplea no sólo como escaparate virtual de productos/servicios, sino también para establecer relaciones con clientes y proveedores.',
      icon: '🌐'
    },
    {
      id: 8,
      category: 'Innovación Tecnológica',
      text: 'Los productos/servicios que desarrolla nuestra empresa llevan incorporada una tecnología difícil de imitar.',
      icon: '💡'
    },
    {
      id: 9,
      category: 'Optimización de Costos',
      text: 'La empresa es referente en su sector en la optimización, en términos de coste, de su cadena de producción, siendo ésta una de sus principales ventajas competitivas.',
      icon: '📊'
    },
    {
      id: 10,
      category: 'Información Competitiva',
      text: 'La informatización de la empresa es una fuente de ventaja competitiva clara respecto a sus competidores.',
      icon: '📈'
    },
    {
      id: 11,
      category: 'Distribución',
      text: 'Los canales de distribución de la empresa son una importante fuente de ventajas competitivas.',
      icon: '🚚'
    },
    {
      id: 12,
      category: 'Diferenciación de Productos',
      text: 'Los productos/servicios de la empresa son altamente, y diferencialmente, valorados por el cliente respecto a nuestros competidores.',
      icon: '⭐'
    },
    {
      id: 13,
      category: 'Marketing y Ventas',
      text: 'La empresa dispone y ejecuta un sistemático plan de marketing y ventas.',
      icon: '📢'
    },
    {
      id: 14,
      category: 'Gestión Financiera',
      text: 'La empresa tiene optimizada su gestión financiera.',
      icon: '💰'
    },
    {
      id: 15,
      category: 'Relación con Clientes',
      text: 'La empresa busca continuamente el mejorar la relación con sus clientes cortando los plazos de ejecución, personalizando la oferta o mejorando las condiciones de entrega. Pero siempre partiendo de un plan previo.',
      icon: '🤝'
    },
    {
      id: 16,
      category: 'Innovación de Productos',
      text: 'La empresa es referente en su sector en el lanzamiento de innovadores productos y servicio de éxito demostrado en el mercado.',
      icon: '🎯'
    },
    {
      id: 17,
      category: 'Recursos Humanos',
      text: 'Los Recursos Humanos son especialmente responsables del éxito de la empresa, considerándolos incluso como el principal activo estratégico.',
      icon: '👥'
    },
    {
      id: 18,
      category: 'Planificación Estratégica',
      text: 'Se tiene una plantilla altamente motivada, que conoce con claridad las metas, objetivos y estrategias de la organización.',
      icon: '🎯'
    },
    {
      id: 19,
      category: 'Estrategia Empresarial',
      text: 'La empresa siempre trabaja conforme a una estrategia y objetivos claros.',
      icon: '🧭'
    },
    {
      id: 20,
      category: 'Gestión del Circulante',
      text: 'La gestión del circulante está optimizada.',
      icon: '🔄'
    },
    {
      id: 21,
      category: 'Posicionamiento Estratégico',
      text: 'Se tiene definido claramente el posicionamiento estratégico de todos los productos de la empresa.',
      icon: '📍'
    },
    {
      id: 22,
      category: 'Política de Marca',
      text: 'Se dispone de una política de marca basada en la reputación que la empresa genera, en la gestión de relación con el cliente y en el posicionamiento estratégico previamente definido.',
      icon: '🏷️'
    },
    {
      id: 23,
      category: 'Fidelización de Clientes',
      text: 'La cartera de clientes de nuestra empresa está altamente fidelizada, ya que tenemos como principal propósito el deleitarlos día a día.',
      icon: '💝'
    },
    {
      id: 24,
      category: 'Política de Ventas',
      text: 'Nuestra política y equipo de ventas y marketing es una importante ventaja competitiva de nuestra empresa respecto al sector.',
      icon: '📈'
    },
    {
      id: 25,
      category: 'Servicio al Cliente',
      text: 'El servicio al cliente que prestamos es uno de nuestras principales ventajas competitivas respecto a nuestros competidores.',
      icon: '🎧'
    }
  ];

  const [diagnosticData, setDiagnosticData] = useState({});
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [expandedAccordion, setExpandedAccordion] = useState('diagnostic');

  // Inicializar datos del diagnóstico
  useEffect(() => {
    if (sectionData?.content) {
      const content = typeof sectionData.content === 'string' 
        ? JSON.parse(sectionData.content) 
        : sectionData.content;
      
      setDiagnosticData(content.diagnostic || {});
      setStrengths(content.strengths || []);
      setWeaknesses(content.weaknesses || []);
    }
  }, [sectionData]);

  // Actualizar datos cuando cambian
  const updateData = (newDiagnostic, newStrengths, newWeaknesses) => {
    const updatedContent = {
      diagnostic: newDiagnostic || diagnosticData,
      strengths: newStrengths || strengths,
      weaknesses: newWeaknesses || weaknesses
    };
    
    onDataUpdate({ 
      ...sectionData, 
      content: updatedContent 
    });
  };

  // Manejar cambio de valoración (sin deselección automática)
  const handleRatingChange = (itemId, value) => {
    const newDiagnostic = {
      ...diagnosticData,
      [itemId]: parseInt(value)
    };
    setDiagnosticData(newDiagnostic);
    updateData(newDiagnostic, strengths, weaknesses);
  };

  // Función para quitar selección
  const clearSelection = (itemId) => {
    const newDiagnostic = { ...diagnosticData };
    delete newDiagnostic[itemId];
    setDiagnosticData(newDiagnostic);
    updateData(newDiagnostic, strengths, weaknesses);
  };

  // Calcular estadísticas
  const calculateStats = () => {
    // Filtrar solo valores que existen (incluyendo 0)
    const values = Object.values(diagnosticData).filter(v => v !== undefined && v !== null);
    if (values.length === 0) return { average: 0, total: 0, completed: 0, improvementPotential: 0 };
    
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const completed = values.length;
    
    // Calcular potencial de mejora: (1 - (suma total / (25 * 4))) * 100
    const maxPossibleScore = diagnosticItems.length * 4; // 25 items * 4 puntos máximos
    const improvementPotential = completed === diagnosticItems.length 
      ? (1 - (total / maxPossibleScore)) * 100 
      : 0;
    
    return { average, total, completed, improvementPotential };
  };

  const stats = calculateStats();
  const completionPercentage = (stats.completed / diagnosticItems.length) * 100;
  const isAllCompleted = stats.completed === diagnosticItems.length;

  // Obtener color según la puntuación
  const getScoreColor = (score) => {
    if (score >= 3.5) return theme.palette.success.main;
    if (score >= 2.5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Opciones de valoración
  const ratingOptions = [
    { value: 0, label: 'En total desacuerdo', color: theme.palette.error.main },
    { value: 1, label: 'No está de acuerdo', color: theme.palette.error.light },
    { value: 2, label: 'Está de acuerdo', color: theme.palette.warning.main },
    { value: 3, label: 'Está bastante de acuerdo', color: theme.palette.info.main },
    { value: 4, label: 'En total acuerdo', color: theme.palette.success.main }
  ];

  // Agregar fortaleza
  const addStrength = () => {
    if (!isAllCompleted) return;
    const newStrengths = [...strengths, ''];
    setStrengths(newStrengths);
    updateData(diagnosticData, newStrengths, weaknesses);
  };

  // Agregar debilidad
  const addWeakness = () => {
    if (!isAllCompleted) return;
    const newWeaknesses = [...weaknesses, ''];
    setWeaknesses(newWeaknesses);
    updateData(diagnosticData, strengths, newWeaknesses);
  };

  // Actualizar fortaleza
  const updateStrength = (index, value) => {
    const newStrengths = [...strengths];
    newStrengths[index] = value;
    setStrengths(newStrengths);
    updateData(diagnosticData, newStrengths, weaknesses);
  };

  // Actualizar debilidad
  const updateWeakness = (index, value) => {
    const newWeaknesses = [...weaknesses];
    newWeaknesses[index] = value;
    setWeaknesses(newWeaknesses);
    updateData(diagnosticData, strengths, newWeaknesses);
  };

  // Eliminar fortaleza
  const removeStrength = (index) => {
    const newStrengths = strengths.filter((_, i) => i !== index);
    setStrengths(newStrengths);
    updateData(diagnosticData, newStrengths, weaknesses);
  };

  // Eliminar debilidad
  const removeWeakness = (index) => {
    const newWeaknesses = weaknesses.filter((_, i) => i !== index);
    setWeaknesses(newWeaknesses);
    updateData(diagnosticData, strengths, newWeaknesses);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header con estadísticas */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <AssessmentIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Typography variant="h4" fontWeight={700} color="primary">
            Autodiagnóstico de la Cadena de Valor Interna
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          A continuación seleccione una puntuación para valorar su empresa en función de cada una de las afirmaciones.
        </Typography>

        {/* Estadísticas */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h3" fontWeight={700} color="primary">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                de {diagnosticItems.length} completadas
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: getScoreColor(stats.average) }}>
                {isAllCompleted ? `${stats.improvementPotential.toFixed(1)}%` : '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Potencial de Mejora de la Cadena de Valor Interna
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Progreso del diagnóstico
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {completionPercentage.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Acordeones principales */}
      <Stack spacing={2}>
        {/* Diagnóstico */}
        <Accordion 
          expanded={expandedAccordion === 'diagnostic'} 
          onChange={() => setExpandedAccordion(expandedAccordion === 'diagnostic' ? '' : 'diagnostic')}
          elevation={0}
          sx={{ 
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              px: 3, 
              py: 2,
              '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2 }
            }}
          >
            <BusinessIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Valoración de la Cadena de Valor
            </Typography>
            <Chip 
              label={`${stats.completed}/${diagnosticItems.length}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3 }}>
            <Grid container spacing={3}>
              {diagnosticItems.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      backgroundColor: diagnosticData[item.id] !== undefined 
                        ? alpha(theme.palette.success.main, 0.02) 
                        : alpha(theme.palette.grey[500], 0.02),
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative'
                    }}
                  >
                    {/* Botón para quitar selección - solo visible si hay selección */}
                    {diagnosticData[item.id] !== undefined && (
                      <Button
                        size="small"
                        onClick={() => clearSelection(item.id)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          minWidth: 'auto',
                          width: 32,
                          height: 24,
                          fontSize: '0.7rem',
                          color: theme.palette.text.secondary,
                          backgroundColor: alpha(theme.palette.grey[500], 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.main
                          },
                          borderRadius: 1,
                          zIndex: 1
                        }}
                      >
                        ✕
                      </Button>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Typography sx={{ fontSize: '1.5rem', minWidth: 32 }}>
                        {item.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="primary" fontWeight={600} gutterBottom>
                          {item.category}
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
                          {item.text}
                        </Typography>
                      </Box>
                      {diagnosticData[item.id] !== undefined && (
                        <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                      )}
                    </Box>
                    
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        value={diagnosticData[item.id] !== undefined ? diagnosticData[item.id].toString() : ''}
                        onChange={(e) => handleRatingChange(item.id, e.target.value)}
                        sx={{ gap: 2, justifyContent: 'center' }}
                      >
                        {ratingOptions.map((option) => (
                          <FormControlLabel
                            key={option.value}
                            value={option.value.toString()}
                            control={
                              <Radio 
                                sx={{ 
                                  color: alpha(option.color, 0.6),
                                  '&.Mui-checked': { color: option.color }
                                }} 
                              />
                            }
                            label={
                              <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                <Typography variant="h6" fontWeight={700}>
                                  {option.value}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.label}
                                </Typography>
                              </Box>
                            }
                            labelPlacement="bottom"
                            sx={{ 
                              m: 0,
                              p: 1,
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: alpha(option.color, 0.08)
                              }
                            }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Potencial de Mejora */}
        <Accordion 
          expanded={expandedAccordion === 'improvement'} 
          onChange={() => setExpandedAccordion(expandedAccordion === 'improvement' ? '' : 'improvement')}
          elevation={0}
          sx={{ 
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              px: 3, 
              py: 2,
              '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2 }
            }}
          >
            <TrendingUpIcon color="secondary" />
            <Typography variant="h6" fontWeight={600}>
              Potencial de Mejora de la Cadena de Valor Interna
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
              Reflexione sobre el resultado obtenido. Anote aquellas observaciones que puedan ser de su interés. 
              Identifique sus fortalezas y debilidades respecto a su cadena de valor.
            </Typography>

            <Grid container spacing={4}>
              {/* Fortalezas */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    backgroundColor: alpha(theme.palette.success.main, 0.02),
                    opacity: isAllCompleted ? 1 : 0.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      FORTALEZAS
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={addStrength}
                      variant="contained"
                      color="success"
                      disabled={!isAllCompleted}
                      sx={{ borderRadius: 2 }}
                    >
                      Agregar
                    </Button>
                  </Box>
                  
                  <Stack spacing={2}>
                    {isAllCompleted ? (
                      <>
                        {strengths.map((strength, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                            <Typography sx={{ mt: 1, color: 'success.main', fontWeight: 'bold' }}>
                              F{index + 1}:
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={strength}
                              onChange={(e) => updateStrength(index, e.target.value)}
                              placeholder="Describe una fortaleza..."
                              variant="outlined"
                              size="small"
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 2,
                                  backgroundColor: theme.palette.background.paper
                                }
                              }}
                            />
                            <Button 
                              size="small" 
                              color="error" 
                              onClick={() => removeStrength(index)}
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              ✕
                            </Button>
                          </Box>
                        ))}
                        
                        {strengths.length === 0 && (
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Haz clic en "Agregar" para identificar las fortalezas de tu cadena de valor.
                          </Alert>
                        )}
                      </>
                    ) : (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        Completa todas las valoraciones para poder agregar fortalezas.
                      </Alert>
                    )}
                  </Stack>
                </Card>
              </Grid>

              {/* Debilidades */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    backgroundColor: alpha(theme.palette.error.main, 0.02),
                    opacity: isAllCompleted ? 1 : 0.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} color="error.main">
                      DEBILIDADES
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={addWeakness}
                      variant="contained"
                      color="error"
                      disabled={!isAllCompleted}
                      sx={{ borderRadius: 2 }}
                    >
                      Agregar
                    </Button>
                  </Box>
                  
                  <Stack spacing={2}>
                    {isAllCompleted ? (
                      <>
                        {weaknesses.map((weakness, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                            <Typography sx={{ mt: 1, color: 'error.main', fontWeight: 'bold' }}>
                              D{index + 1}:
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={weakness}
                              onChange={(e) => updateWeakness(index, e.target.value)}
                              placeholder="Describe una debilidad..."
                              variant="outlined"
                              size="small"
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 2,
                                  backgroundColor: theme.palette.background.paper
                                }
                              }}
                            />
                            <Button 
                              size="small" 
                              color="error" 
                              onClick={() => removeWeakness(index)}
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              ✕
                            </Button>
                          </Box>
                        ))}
                        
                        {weaknesses.length === 0 && (
                          <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            Haz clic en "Agregar" para identificar las debilidades de tu cadena de valor.
                          </Alert>
                        )}
                      </>
                    ) : (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        Completa todas las valoraciones para poder agregar debilidades.
                      </Alert>
                    )}
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  );
};

export default ValueChainDiagnosticSection;