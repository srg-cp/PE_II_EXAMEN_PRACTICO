import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import CollaborativeEditor from '../components/Editor/CollaborativeEditor';
import axios from 'axios';

const DocumentEditor = () => {
  const { projectId, documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocument();
    fetchProject();
  }, [documentId, projectId]);

  const fetchDocument = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setDocument(response.data);
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getToken('token')}`
          }
        }
      );
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content) => {
    setSaving(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/documents/${documentId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setDocument({ ...document, content });
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/project/${projectId}/board`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Cargando documento...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Volver al Proyecto
          </Button>
          <Box>
            <Typography variant="h5" component="h1">
              {document?.title || 'Documento sin título'}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {project?.name}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={saving}
          onClick={() => handleSave(document?.content)}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>

      <Paper elevation={1} sx={{ minHeight: '70vh' }}>
        <CollaborativeEditor
          documentId={documentId}
          initialContent={document?.content || ''}
          onSave={handleSave}
        />
      </Paper>
    </Container>
  );
};

export default DocumentEditor;