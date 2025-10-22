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
  BusinessCenter as PorterIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const PorterForcesSection = ({ projectId, sectionData, onDataUpdate }) => {
  const theme = useTheme();
  
  // Datos de las 5 fuerzas de Porter basados en la imagen proporcionada
  const porterItems = [
    // Rivalidad entre competidores existentes
    {
      id: 1,
      category: 'Rivalidad empresas del sector',
      text: 'Crecimiento',
      icon: '📈'
    },
    {
      id: 2,
      category: 'Rivalidad empresas del sector',
      text: 'Naturaleza de los competidores',
      icon: '🏢'
    },
    {
      id: 3,
      category: 'Rivalidad empresas del sector',
      text: 'Exceso de capacidad productiva',
      icon: '⚡'
    },
    {
      id: 4,
      category: 'Rivalidad empresas del sector',
      text: 'Rentabilidad media del sector',
      icon: '💰'
    },
    {
      id: 5,
      category: 'Rivalidad empresas del sector',
      text: 'Diferenciación del producto',
      icon: '🎯'
    },
    {
      id: 6,
      category: 'Rivalidad empresas del sector',
      text: 'Barreras de salida',
      icon: '🚪'
    },
    // Barreras de Entrada
    {
      id: 7,
      category: 'Barreras de Entrada',
      text: 'Economías de escala',
      icon: '📊'
    },
    {
      id: 8,
      category: 'Barreras de Entrada',
      text: 'Necesidad de capital',
      icon: '💵'
    },
    {
      id: 9,
      category: 'Barreras de Entrada',
      text: 'Acceso a la tecnología',
      icon: '💻'
    },
    {
      id: 10,
      category: 'Barreras de Entrada',
      text: 'Regulaciones y barreras legales',
      icon: '⚖️'
    },
    {
      id: 11,
      category: 'Barreras de Entrada',
      text: 'Diferenciación del producto',
      icon: '🌟'
    },
    {
      id: 12,
      category: 'Barreras de Entrada',
      text: 'Acceso a canales de distribución',
      icon: '🚚'
    },
    // Poder de los Clientes
    {
      id: 13,
      category: 'Poder de los Clientes',
      text: 'Número de clientes importantes',
      icon: '👥'
    },
    {
      id: 14,
      category: 'Poder de los Clientes',
      text: 'Disponibilidad de productos sustitutos para el cliente',
      icon: '🔄'
    },
    {
      id: 15,
      category: 'Poder de los Clientes',
      text: 'Costo de cambio del cliente',
      icon: '💸'
    },
    {
      id: 16,
      category: 'Poder de los Clientes',
      text: 'Nivel de integración hacia atrás de los compradores',
      icon: '🔗'
    },
    {
      id: 17,
      category: 'Poder de los Clientes',
      text: 'Rentabilidad de los compradores',
      icon: '📈'
    },
    // Productos Sustitutos
    {
      id: 18,
      category: 'Productos Sustitutos',
      text: 'Disponibilidad de productos sustitutos',
      icon: '🔄'
    },
    {
      id: 19,
      category: 'Productos Sustitutos',
      text: 'Costo de cambio del usuario',
      icon: '💰'
    },
    {
      id: 20,
      category: 'Productos Sustitutos',
      text: 'Agresividad del productor del sustituto',
      icon: '⚔️'
    },
    {
      id: 21,
      category: 'Productos Sustitutos',
      text: 'Precio relativo de los productos sustitutos',
      icon: '🏷️'
    },
    // Poder de los Proveedores
    {
      id: 22,
      category: 'Poder de los Proveedores',
      text: 'Número de proveedores importantes',
      icon: '🏭'
    },
    {
      id: 23,
      category: 'Poder de los Proveedores',
      text: 'Disponibilidad de sustitutos para los productos del proveedor',
      icon: '🔄'
    },
    {
      id: 24,
      category: 'Poder de los Proveedores',
      text: 'Diferenciación o costo de cambio de los productos del proveedor',
      icon: '🎯'
    },
    {
      id: 25,
      category: 'Poder de los Proveedores',
      text: 'Amenaza de integración hacia adelante por parte de los proveedores',
      icon: '➡️'
    },
    {
      id: 26,
      category: 'Poder de los Proveedores',
      text: 'Importancia de la industria para los proveedores',
      icon: '⭐'
    }
  ];

  const [porterData, setPorterData] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [threats, setThreats] = useState([]);
  const [expandedAccordion, setExpandedAccordion] = useState('porter');

  // Inicializar datos
  useEffect(() => {
    if (sectionData?.content) {
      const content = typeof sectionData.content === 'string' 
        ? JSON.parse(sectionData.content) 
        : sectionData.content;
      
      setPorterData(content.porter || {});
      setOpportunities(content.opportunities || []);
      setThreats(content.threats || []);
    }
  }, [sectionData]);

  // Actualizar datos cuando cambian
  const updateData = (newPorter, newOpportunities, newThreats) => {
    const updatedContent = {
      porter: newPorter || porterData,
      opportunities: newOpportunities || opportunities,
      threats: newThreats || threats
    };
    
    onDataUpdate({ 
      ...sectionData, 
      content: updatedContent 
    });
  };

  // Manejar cambio de valoración
  const handleRatingChange = (itemId, value) => {
    const newPorter = {
      ...porterData,
      [itemId]: parseInt(value)
    };
    setPorterData(newPorter);
    updateData(newPorter, opportunities, threats);
  };

  // Función para quitar selección
  const clearSelection = (itemId) => {
    const newPorter = { ...porterData };
    delete newPorter[itemId];
    setPorterData(newPorter);
    updateData(newPorter, opportunities, threats);
  };

  // Calcular estadísticas
  const calculateStats = () => {
    const values = Object.values(porterData).filter(v => v !== undefined && v !== null);
    if (values.length === 0) return { average: 0, total: 0, completed: 0, attractiveness: 0 };
    
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const completed = values.length;
    
    // Calcular atractivo del mercado: (suma total / (26 * 7)) * 100
    const maxPossibleScore = porterItems.length * 7; // 26 items * 7 puntos máximos
    const attractiveness = completed === porterItems.length 
      ? (total / maxPossibleScore) * 100 
      : 0;
    
    return { average, total, completed, attractiveness };
  };

  const stats = calculateStats();
  const completionPercentage = (stats.completed / porterItems.length) * 100;
  const isAllCompleted = stats.completed === porterItems.length;

  // Obtener color según la puntuación
  const getScoreColor = (score) => {
    if (score >= 5) return theme.palette.success.main;
    if (score >= 3) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Obtener conclusión basada en el puntaje total
  const getConclusion = () => {
    if (!isAllCompleted) return '';
    
    if (stats.total >= 140) {
      return 'La situación actual del mercado es favorable a la empresa.';
    } else if (stats.total >= 91) {
      return 'La situación actual del mercado es neutral para la empresa.';
    } else {
      return 'La situación actual del mercado es desfavorable a la empresa.';
    }
  };

  // Opciones de valoración (1-7)
  const ratingOptions = [
    { value: 1, label: 'Muy Bajo', color: theme.palette.error.main },
    { value: 2, label: 'Bajo', color: theme.palette.error.light },
    { value: 3, label: 'Poco', color: theme.palette.warning.main },
    { value: 4, label: 'Medio', color: theme.palette.info.main },
    { value: 5, label: 'Alto', color: theme.palette.success.light },
    { value: 6, label: 'Muy Alto', color: theme.palette.success.main },
    { value: 7, label: 'Favorable', color: theme.palette.success.dark }
  ];

  // Agregar oportunidad
  const addOpportunity = () => {
    if (!isAllCompleted) return;
    const newOpportunities = [...opportunities, ''];
    setOpportunities(newOpportunities);
    updateData(porterData, newOpportunities, threats);
  };

  // Agregar amenaza
  const addThreat = () => {
    if (!isAllCompleted) return;
    const newThreats = [...threats, ''];
    setThreats(newThreats);
    updateData(porterData, opportunities, newThreats);
  };

  // Actualizar oportunidad
  const updateOpportunity = (index, value) => {
    const newOpportunities = [...opportunities];
    newOpportunities[index] = value;
    setOpportunities(newOpportunities);
    updateData(porterData, newOpportunities, threats);
  };

  // Actualizar amenaza
  const updateThreat = (index, value) => {
    const newThreats = [...threats];
    newThreats[index] = value;
    setThreats(newThreats);
    updateData(porterData, opportunities, newThreats);
  };

  // Eliminar oportunidad
  const removeOpportunity = (index) => {
    const newOpportunities = opportunities.filter((_, i) => i !== index);
    setOpportunities(newOpportunities);
    updateData(porterData, newOpportunities, threats);
  };

  // Eliminar amenaza
  const removeThreat = (index) => {
    const newThreats = threats.filter((_, i) => i !== index);
    setThreats(newThreats);
    updateData(porterData, opportunities, newThreats);
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
          <PorterIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Typography variant="h4" fontWeight={700} color="primary">
            Las 5 Fuerzas de Porter
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          A continuación seleccione una puntuación del 1 al 7 para valorar cada una de las fuerzas competitivas que afectan a su empresa.
        </Typography>

        {/* Estadísticas */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h3" fontWeight={700} color="primary">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                de {porterItems.length} completadas
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: getScoreColor(stats.average) }}>
                {isAllCompleted ? stats.total : '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Progreso del análisis
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

        {/* Conclusión */}
        {isAllCompleted && (
          <Alert 
            severity={stats.total >= 140 ? 'success' : stats.total >= 91 ? 'info' : 'warning'}
            sx={{ mt: 3, borderRadius: 3 }}
          >
            <Typography variant="body1" fontWeight={600}>
              CONCLUSIÓN: {getConclusion()}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Acordeones principales */}
      <Stack spacing={2}>
        {/* Análisis de Porter */}
        <Accordion 
          expanded={expandedAccordion === 'porter'} 
          onChange={() => setExpandedAccordion(expandedAccordion === 'porter' ? '' : 'porter')}
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
              Análisis de las 5 Fuerzas Competitivas
            </Typography>
            <Chip 
              label={`${stats.completed}/${porterItems.length}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3 }}>
            {/* Agrupar por categorías */}
            {['Rivalidad empresas del sector', 'Barreras de Entrada', 'Poder de los Clientes', 'Productos Sustitutos', 'Poder de los Proveedores'].map((category) => (
              <Box key={category} sx={{ mb: 4 }}>
                <Typography variant="h6" color="primary" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {category === 'Rivalidad empresas del sector' && '⚔️'}
                  {category === 'Barreras de Entrada' && '🚧'}
                  {category === 'Poder de los Clientes' && '👥'}
                  {category === 'Productos Sustitutos' && '🔄'}
                  {category === 'Poder de los Proveedores' && '🏭'}
                  {category}
                </Typography>
                <Grid container spacing={2}>
                  {porterItems.filter(item => item.category === category).map((item) => (
                    <Grid item xs={12} md={6} key={item.id}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          borderRadius: 3,
                          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          backgroundColor: porterData[item.id] !== undefined 
                            ? alpha(theme.palette.success.main, 0.02) 
                            : alpha(theme.palette.grey[500], 0.02),
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          height: '100%'
                        }}
                      >
                        {/* Botón para quitar selección */}
                        {porterData[item.id] !== undefined && (
                          <Button
                            size="small"
                            onClick={() => clearSelection(item.id)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              minWidth: 'auto',
                              width: 24,
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
                          <Typography sx={{ fontSize: '1.2rem', minWidth: 24 }}>
                            {item.icon}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ lineHeight: 1.4, mb: 2, fontWeight: 500 }}>
                              {item.text}
                            </Typography>
                          </Box>
                          {porterData[item.id] !== undefined && (
                            <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
                          )}
                        </Box>
                        
                        <FormControl component="fieldset">
                          <RadioGroup
                            row
                            value={porterData[item.id] !== undefined ? porterData[item.id].toString() : ''}
                            onChange={(e) => handleRatingChange(item.id, e.target.value)}
                            sx={{ gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}
                          >
                            {ratingOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value.toString()}
                                control={
                                  <Radio 
                                    size="small"
                                    sx={{ 
                                      color: alpha(option.color, 0.6),
                                      '&.Mui-checked': { color: option.color },
                                      p: 0.5
                                    }} 
                                  />
                                }
                                label={
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                    {option.value}
                                  </Typography>
                                }
                                labelPlacement="bottom"
                                sx={{ 
                                  m: 0,
                                  minWidth: 'auto'
                                }}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Oportunidades y Amenazas */}
        <Accordion 
          expanded={expandedAccordion === 'analysis'} 
          onChange={() => setExpandedAccordion(expandedAccordion === 'analysis' ? '' : 'analysis')}
          elevation={0}
          disabled={!isAllCompleted}
          sx={{ 
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            '&:before': { display: 'none' },
            opacity: isAllCompleted ? 1 : 0.6
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
            <AnalyticsIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Identificación de Oportunidades y Amenazas
            </Typography>
            {!isAllCompleted && (
              <Chip 
                label="Complete el análisis primero" 
                size="small" 
                color="warning" 
                variant="outlined"
              />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3 }}>
            {!isAllCompleted ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                <Typography>
                  Complete el análisis de las 5 fuerzas de Porter para identificar oportunidades y amenazas.
                </Typography>
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {/* Oportunidades */}
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      border: `2px solid ${theme.palette.success.main}`,
                      backgroundColor: alpha(theme.palette.success.main, 0.02)
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                        🌟 OPORTUNIDADES
                      </Typography>
                      <Button 
                        size="small" 
                        onClick={addOpportunity}
                        sx={{ color: theme.palette.success.main }}
                      >
                        Agregar
                      </Button>
                    </Box>
                    <Stack spacing={2}>
                      {opportunities.map((opportunity, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                          <Typography variant="body2" sx={{ mt: 1, minWidth: 24 }}>
                            O{index + 1}:
                          </Typography>
                          <TextField
                            size="small"
                            value={opportunity}
                            onChange={(e) => updateOpportunity(index, e.target.value)}
                            placeholder="Describe una oportunidad identificada..."
                            multiline
                            rows={2}
                            sx={{ flex: 1 }}
                          />
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => removeOpportunity(index)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            ✕
                          </Button>
                        </Box>
                      ))}
                      {opportunities.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No hay oportunidades identificadas. Haz clic en "Agregar" para añadir una.
                        </Typography>
                      )}
                    </Stack>
                  </Card>
                </Grid>

                {/* Amenazas */}
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      border: `2px solid ${theme.palette.error.main}`,
                      backgroundColor: alpha(theme.palette.error.main, 0.02)
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                        ⚠️ AMENAZAS
                      </Typography>
                      <Button 
                        size="small" 
                        onClick={addThreat}
                        sx={{ color: theme.palette.error.main }}
                      >
                        Agregar
                      </Button>
                    </Box>
                    <Stack spacing={2}>
                      {threats.map((threat, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                          <Typography variant="body2" sx={{ mt: 1, minWidth: 24 }}>
                            A{index + 1}:
                          </Typography>
                          <TextField
                            size="small"
                            value={threat}
                            onChange={(e) => updateThreat(index, e.target.value)}
                            placeholder="Describe una amenaza identificada..."
                            multiline
                            rows={2}
                            sx={{ flex: 1 }}
                          />
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => removeThreat(index)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            ✕
                          </Button>
                        </Box>
                      ))}
                      {threats.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No hay amenazas identificadas. Haz clic en "Agregar" para añadir una.
                        </Typography>
                      )}
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  );
};

export default PorterForcesSection;