import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  Typography,
  Chip,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  PhotoCamera,
  Close as CloseIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';

const CreateProjectModal = ({ open, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objectives: '',
    image: ''
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUserOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(`/api/auth/search-users?query=${encodeURIComponent(query)}`);
      setUserOptions(response.data.users || []);
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      setUserOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('El nombre del proyecto es requerido');
      return;
    }
  
    setCreating(true);
    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        objectives: formData.objectives.trim(),
        image: formData.image || '',
        memberIds: selectedMembers.map(member => member._id)
      };
  
      console.log('Enviando datos del proyecto:', projectData);
  
      const response = await axios.post('/api/projects', projectData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Proyecto creado exitosamente:', response.data);
      onProjectCreated(response.data.project);
      handleClose();
    } catch (error) {
      console.error('Error creando proyecto:', error);
      console.error('Error response:', error.response?.data);
      
      // Mostrar mensaje de error más específico
      const errorMessage = error.response?.data?.message || 'Error creando el proyecto';
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', objectives: '', image: '' });
    setSelectedMembers([]);
    setUserOptions([]);
    setImagePreview('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Crear Nuevo Proyecto</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Imagen del proyecto */}
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Typography variant="subtitle2">Imagen del Proyecto (Opcional)</Typography>
              <Box position="relative">
                <Avatar
                  src={imagePreview}
                  sx={{ width: 120, height: 120, bgcolor: 'grey.200' }}
                >
                  {!imagePreview && <PersonIcon sx={{ fontSize: 60 }} />}
                </Avatar>
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: -8,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <PhotoCamera />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </IconButton>
              </Box>
            </Box>

            {/* Nombre del proyecto */}
            <TextField
              name="name"
              label="Nombre del Proyecto"
              value={formData.name}
              onChange={handleInputChange}
              required
              fullWidth
            />

            {/* Descripción */}
            <TextField
              name="description"
              label="Descripción"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
            />

            {/* Objetivos */}
            <TextField
              name="objectives"
              label="Objetivos"
              value={formData.objectives}
              onChange={handleInputChange}
              multiline
              rows={2}
              fullWidth
            />

            {/* Participantes */}
            <Autocomplete
              multiple
              options={userOptions}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedMembers}
              onChange={(event, newValue) => setSelectedMembers(newValue)}
              onInputChange={(event, newInputValue) => searchUsers(newInputValue)}
              loading={searchLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Agregar Participantes"
                  placeholder="Buscar por nombre o email..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} display="flex" alignItems="center" gap={1}>
                  <Avatar src={option.avatar} sx={{ width: 32, height: 32 }}>
                    {option.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    avatar={<Avatar src={option.avatar}>{option.name.charAt(0)}</Avatar>}
                    label={option.name}
                    size="small"
                  />
                ))
              }
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={creating}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.name.trim() || creating}
            startIcon={creating && <CircularProgress size={20} />}
          >
            {creating ? 'Creando...' : 'Crear Proyecto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateProjectModal;