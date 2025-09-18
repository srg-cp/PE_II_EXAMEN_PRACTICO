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
  Card,
  CardContent,
  CardHeader,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const FodaSection = ({ projectId, sectionData, onDataUpdate, user, project }) => {
  const [fodaData, setFodaData] = useState({
    fortalezas: [],
    oportunidades: [],
    debilidades: [],
    amenazas: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastModified, setLastModified] = useState(null);

  useEffect(() => {
    if (sectionData?.content) {
      setFodaData(sectionData.content);
    }
    if (sectionData?.lastModified) {
      setLastModified(sectionData.lastModified);
    }
  }, [sectionData]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const response = await axios.put(`/api/projects/${projectId}/sections/foda`, {
        content: fodaData,
        userId: user._id
      });
      
      onDataUpdate(response.data);
      setLastModified(response.data.lastModified);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving FODA:', error);
      setError(error.response?.data?.message || 'Error al guardar el análisis FODA');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFodaData(sectionData?.content || {
      fortalezas: [],
      oportunidades: [],
      debilidades: [],
      amenazas: []
    });
    setIsEditing(false);
    setError('');
  };

  const addItem = (category) => {
    setFodaData(prev => ({
      ...prev,
      [category]: [...prev[category], '']
    }));
  };

  const removeItem = (category, index) => {
    setFodaData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (category, index, value) => {
    setFodaData(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => i === index ? value : item)
    }));
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  const canEdit = project?.owner?._id === user?._id || 
                 project?.members?.some(member => member._id === user?._id);

  const fodaCategories = [
    {
      key: 'fortalezas',
      title: 'FORTALEZAS',
      color: '#e8f5e8',
      headerColor: '#c8e6c9',
      items: fodaData.fortalezas
    },
    {
      key: 'oportunidades',
      title: 'OPORTUNIDADES',
      color: '#fff3e0',
      headerColor: '#ffcc02',
      items: fodaData.oportunidades
    },
    {
      key: 'debilidades',
      title: 'DEBILIDADES',
      color: '#fff8e1',
      headerColor: '#fff176',
      items: fodaData.debilidades
    },
    {
      key: 'amenazas',
      title: 'AMENAZAS',
      color: '#ffebee',
      headerColor: '#ef9a9a',
      items: fodaData.amenazas
    }
  ];

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Información de última modificación */}
      {lastModified && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="caption" color="text.secondary">
            Última modificación:
          </Typography>
          <Chip
            avatar={<Avatar sx={{ width: 20, height: 20 }}>{lastModified.user?.name?.charAt(0)}</Avatar>}
            label={`${lastModified.user?.name} - ${new Date(lastModified.date).toLocaleString()}`}
            size="small"
            variant="outlined"
          />
        </Box>
      )}

      {/* Botones de acción */}
      <Box display="flex" gap={2} mb={3}>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
            disabled={!canEdit}
          >
            Editar Análisis FODA
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
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

      {/* Título del análisis FODA */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h5" component="h3" sx={{ 
          bgcolor: '#1976d2', 
          color: 'white', 
          p: 2, 
          borderRadius: 1 
        }}>
          ANÁLISIS FODA
        </Typography>
      </Box>

      {/* Matriz FODA */}
      <Grid container spacing={2}>
        {fodaCategories.map((category) => (
          <Grid item xs={12} md={6} key={category.key}>
            <Card sx={{ height: '100%', bgcolor: category.color }}>
              <CardHeader
                title={category.title}
                sx={{ 
                  bgcolor: category.headerColor, 
                  textAlign: 'center',
                  '& .MuiCardHeader-title': {
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }
                }}
                action={
                  isEditing && (
                    <IconButton onClick={() => addItem(category.key)}>
                      <AddIcon />
                    </IconButton>
                  )
                }
              />
              <CardContent sx={{ height: 350, overflow: 'auto' }}>
                {category.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, position: 'relative' }}>
                    {isEditing && (
                      <IconButton
                        size="small"
                        onClick={() => removeItem(category.key, index)}
                        sx={{ position: 'absolute', top: -8, right: -8, zIndex: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                    <ReactQuill
                      value={item}
                      onChange={(value) => updateItem(category.key, index, value)}
                      readOnly={!isEditing}
                      modules={quillModules}
                      theme="snow"
                      placeholder={`${category.title.toLowerCase()} ${index + 1}...`}
                      style={{ minHeight: '80px' }}
                    />
                  </Box>
                ))}
                {category.items.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No hay {category.title.toLowerCase()} definidas
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!canEdit && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Solo el propietario y miembros del proyecto pueden editar esta sección.
        </Alert>
      )}
    </Box>
  );
};

export default FodaSection;