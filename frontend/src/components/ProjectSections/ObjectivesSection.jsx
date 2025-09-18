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
  CardHeader
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

const ObjectivesSection = ({ projectId, sectionData, onDataUpdate, user, project }) => {
  const [objectives, setObjectives] = useState({
    mission: '',
    generalObjectives: [],
    specificObjectives: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastModified, setLastModified] = useState(null);

  useEffect(() => {
    if (sectionData?.content) {
      setObjectives(sectionData.content);
    }
    if (sectionData?.lastModified) {
      setLastModified(sectionData.lastModified);
    }
  }, [sectionData]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const response = await axios.put(`/api/projects/${projectId}/sections/objectives`, {
        content: objectives,
        userId: user._id
      });
      
      onDataUpdate(response.data);
      setLastModified(response.data.lastModified);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving objectives:', error);
      setError(error.response?.data?.message || 'Error al guardar los objetivos');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setObjectives(sectionData?.content || {
      mission: '',
      generalObjectives: [],
      specificObjectives: []
    });
    setIsEditing(false);
    setError('');
  };

  const addGeneralObjective = () => {
    setObjectives(prev => ({
      ...prev,
      generalObjectives: [...prev.generalObjectives, '']
    }));
  };

  const removeGeneralObjective = (index) => {
    setObjectives(prev => ({
      ...prev,
      generalObjectives: prev.generalObjectives.filter((_, i) => i !== index)
    }));
  };

  const updateGeneralObjective = (index, value) => {
    setObjectives(prev => ({
      ...prev,
      generalObjectives: prev.generalObjectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const addSpecificObjective = () => {
    setObjectives(prev => ({
      ...prev,
      specificObjectives: [...prev.specificObjectives, '']
    }));
  };

  const removeSpecificObjective = (index) => {
    setObjectives(prev => ({
      ...prev,
      specificObjectives: prev.specificObjectives.filter((_, i) => i !== index)
    }));
  };

  const updateSpecificObjective = (index, value) => {
    setObjectives(prev => ({
      ...prev,
      specificObjectives: prev.specificObjectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  const canEdit = project?.owner?._id === user?._id || 
                 project?.members?.some(member => member._id === user?._id);

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
            Editar Objetivos
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

      <Grid container spacing={3}>
        {/* Columna de Misión */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#e8f5e8' }}>
            <CardHeader
              title="MISIÓN"
              sx={{ bgcolor: '#c8e6c9', textAlign: 'center' }}
            />
            <CardContent sx={{ height: 400, overflow: 'auto' }}>
              <ReactQuill
                value={objectives.mission}
                onChange={(value) => setObjectives(prev => ({ ...prev, mission: value }))}
                readOnly={!isEditing}
                modules={quillModules}
                theme="snow"
                placeholder="Describe la misión..."
                style={{ height: '300px' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Columna de Objetivos Generales */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
            <CardHeader
              title="OBJETIVOS GENERALES O ESTRATÉGICOS"
              sx={{ bgcolor: '#bbdefb', textAlign: 'center' }}
              action={
                isEditing && (
                  <IconButton onClick={addGeneralObjective}>
                    <AddIcon />
                  </IconButton>
                )
              }
            />
            <CardContent sx={{ height: 400, overflow: 'auto' }}>
              {objectives.generalObjectives.map((objective, index) => (
                <Box key={index} sx={{ mb: 2, position: 'relative' }}>
                  {isEditing && (
                    <IconButton
                      size="small"
                      onClick={() => removeGeneralObjective(index)}
                      sx={{ position: 'absolute', top: -8, right: -8, zIndex: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <ReactQuill
                    value={objective}
                    onChange={(value) => updateGeneralObjective(index, value)}
                    readOnly={!isEditing}
                    modules={quillModules}
                    theme="snow"
                    placeholder={`Objetivo general ${index + 1}...`}
                    style={{ minHeight: '100px' }}
                  />
                </Box>
              ))}
              {objectives.generalObjectives.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No hay objetivos generales definidos
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Columna de Objetivos Específicos */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
            <CardHeader
              title="OBJETIVOS ESPECÍFICOS"
              sx={{ bgcolor: '#ffcc02', textAlign: 'center' }}
              action={
                isEditing && (
                  <IconButton onClick={addSpecificObjective}>
                    <AddIcon />
                  </IconButton>
                )
              }
            />
            <CardContent sx={{ height: 400, overflow: 'auto' }}>
              {objectives.specificObjectives.map((objective, index) => (
                <Box key={index} sx={{ mb: 2, position: 'relative' }}>
                  {isEditing && (
                    <IconButton
                      size="small"
                      onClick={() => removeSpecificObjective(index)}
                      sx={{ position: 'absolute', top: -8, right: -8, zIndex: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <ReactQuill
                    value={objective}
                    onChange={(value) => updateSpecificObjective(index, value)}
                    readOnly={!isEditing}
                    modules={quillModules}
                    theme="snow"
                    placeholder={`Objetivo específico ${index + 1}...`}
                    style={{ minHeight: '100px' }}
                  />
                </Box>
              ))}
              {objectives.specificObjectives.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No hay objetivos específicos definidos
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!canEdit && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Solo el propietario y miembros del proyecto pueden editar esta sección.
        </Alert>
      )}
    </Box>
  );
};

export default ObjectivesSection;