import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const VisionSection = ({ projectId, sectionData, onDataUpdate, user, project }) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastModified, setLastModified] = useState(null);

  useEffect(() => {
    if (sectionData?.content) {
      setContent(sectionData.content);
    }
    if (sectionData?.lastModified) {
      setLastModified(sectionData.lastModified);
    }
  }, [sectionData]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const response = await axios.put(`/api/projects/${projectId}/sections/vision`, {
        content,
        userId: user._id
      });
      
      onDataUpdate(response.data);
      setLastModified(response.data.lastModified);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving vision:', error);
      setError(error.response?.data?.message || 'Error al guardar la visión');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(sectionData?.content || '');
    setIsEditing(false);
    setError('');
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link'],
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
            Editar Visión
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

      {/* Editor de contenido */}
      <Box sx={{ minHeight: 300 }}>
        <ReactQuill
          value={content}
          onChange={setContent}
          readOnly={!isEditing}
          modules={quillModules}
          theme="snow"
          placeholder="Escribe la visión del proyecto aquí..."
          style={{
            backgroundColor: isEditing ? 'white' : '#f5f5f5',
            border: isEditing ? '1px solid #ccc' : '1px solid #e0e0e0'
          }}
        />
      </Box>

      {!canEdit && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Solo el propietario y miembros del proyecto pueden editar esta sección.
        </Alert>
      )}
    </Box>
  );
};

export default VisionSection;