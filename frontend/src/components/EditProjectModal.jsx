import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import {
  AddAPhoto as PhotoCamera,
  Close as CloseIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const EditProjectModal = ({ open, onClose, project, onProjectUpdated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objectives: '',
    image: '',
    status: 'draft'
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [settings, setSettings] = useState({
    isPublic: false,
    allowComments: true
  });
  const [error, setError] = useState('');

  // Cargar datos del proyecto cuando se abre el modal
  useEffect(() => {
    if (project && open) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        objectives: project.objectives || '',
        image: project.image || '',
        status: project.status || 'draft'
      });
      setImagePreview(project.image || '');
      setSelectedMembers(project.members?.filter(member => member._id !== project.owner._id) || []);
      setSettings(project.settings || { isPublic: false, allowComments: true });
      setError('');
    }
  }, [project, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (setting) => (e) => {
    setSettings(prev => ({
      ...prev,
      [setting]: e.target.checked
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

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
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
      setError('El nombre del proyecto es requerido');
      return;
    }

    setUpdating(true);
    setError('');
    
    try {
      const updateData = {
        ...formData,
        memberIds: selectedMembers.map(member => member._id),
        settings
      };

      const response = await axios.put(`/api/projects/${project._id}`, updateData);
      onProjectUpdated(response.data.project);
      handleClose();
    } catch (error) {
      console.error('Error actualizando proyecto:', error);
      setError(error.response?.data?.message || 'Error al actualizar el proyecto');
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', objectives: '', image: '', status: 'draft' });
    setSelectedMembers([]);
    setUserOptions([]);
    setImagePreview('');
    setSettings({ isPublic: false, allowComments: true });
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '32px'
        }
      }}
    >
      <DialogTitle sx={{ mb: -5 }}>
        <Box display="flex" justifyContent="flex-end" alignItems="flex-start" sx={{ mb: 1 }}>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
          <EditIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            fontSize: '2.5rem'
          }}
        >
          Editar Proyecto
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert>
            )}

            {/* Imagen del proyecto */}
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box position="relative">
                <Tooltip title="Haz clic para seleccionar una foto (opcional)" arrow>
                  <Avatar
                    src={imagePreview}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      bgcolor: 'grey.200',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                        transition: 'opacity 0.2s ease-in-out'
                      }
                    }}
                    component="label"
                  >
                    {!imagePreview && <PersonIcon sx={{ fontSize: 60 }} />}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Avatar>
                </Tooltip>
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
                {imagePreview && (
                  <IconButton
                    onClick={removeImage}
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: -4,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Información básica */}
            <TextField
              name="name"
              label="Nombre del Proyecto"
              value={formData.name}
              onChange={handleInputChange}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px'
                }
              }}
            />

            <TextField
              name="description"
              label="Descripción"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px'
                }
              }}
            />

            {/* Estado del proyecto */}
            <FormControl fullWidth>
              <InputLabel>Estado del Proyecto</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Estado del Proyecto"
                sx={{
                  borderRadius: '16px'
                }}
              >
                <MenuItem value="draft">Borrador</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="archived">Archivado</MenuItem>
              </Select>
            </FormControl>

            {/* Mostrar owner */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Propietario:
              </Typography>
              <Chip
                avatar={<Avatar src={project?.owner?.avatar}>{project?.owner?.name?.charAt(0)}</Avatar>}
                label={`${project?.owner?.name} (Propietario)`}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: '16px' }}
              />
            </Box>

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
                  label="Agregar/Quitar Participantes"
                  placeholder="Buscar por nombre o email..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px'
                    }
                  }}
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
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps} display="flex" alignItems="center" gap={1}>
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
                );
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...otherProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      {...otherProps}
                      avatar={<Avatar src={option.avatar}>{option.name.charAt(0)}</Avatar>}
                      label={option.name}
                      size="small"
                    />
                  );
                })
              }
            />

            {/* Configuraciones */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Configuraciones del Proyecto
              </Typography>
              <Box display="flex" flexDirection="row" gap={3} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.isPublic}
                      onChange={handleSettingsChange('isPublic')}
                    />
                  }
                  label="Proyecto público"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowComments}
                      onChange={handleSettingsChange('allowComments')}
                    />
                  }
                  label="Permitir comentarios"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={updating}
            sx={{
              borderRadius: '32px',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.name.trim() || updating}
            startIcon={updating && <CircularProgress size={20} />}
            sx={{
              borderRadius: '32px',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {updating ? 'Actualizando...' : 'Actualizar Proyecto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProjectModal;