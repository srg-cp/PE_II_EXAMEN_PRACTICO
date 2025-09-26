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
  Divider,
  Grid,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera,
  Person as PersonIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const UserProfileModal = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();
  const { currentTheme, setTheme, navigationStyle, setNavigationStyle } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: ''
  });

  // Colores de tema disponibles
  const themeColors = [
    { name: 'Clásico', primary: '#6750a4', secondary: '#625b71', background: '#f7f2fa', id: 'classic' },
    { name: 'Azul', primary: '#1976d2', secondary: '#1565c0', background: '#e3f2fd', id: 'blue' },
    { name: 'Verde', primary: '#388e3c', secondary: '#2e7d32', background: '#e8f5e8', id: 'green' },
    { name: 'Naranja', primary: '#f57c00', secondary: '#ef6c00', background: '#fff3e0', id: 'orange' },
    { name: 'Cian', primary: '#0097a7', secondary: '#00838f', background: '#e0f2f1', id: 'cyan' },
    { name: 'Púrpura', primary: '#7b1fa2', secondary: '#6a1b9a', background: '#f3e5f5', id: 'purple' },
    { name: 'Violeta', primary: '#5e35b1', secondary: '#512da8', background: '#ede7f6', id: 'violet' },
    { name: 'Azul Oscuro', primary: '#303f9f', secondary: '#283593', background: '#e8eaf6', id: 'darkblue' },
    { name: 'Rojo', primary: '#d32f2f', secondary: '#c62828', background: '#ffebee', id: 'red' },
    { name: 'Ámbar', primary: '#ff8f00', secondary: '#ff6f00', background: '#fff8e1', id: 'amber' },
    { name: 'Rosa', primary: '#c2185b', secondary: '#ad1457', background: '#fce4ec', id: 'pink' },
    { name: 'Minimalista', primary: '#424242', secondary: '#616161', background: '#fafafa', id: 'minimal' }
  ];

  // Estilos de navegación
  const navigationStyles = [
    { name: 'Clásica', id: 'classic' },
    { name: 'Moderna', id: 'modern' },
    { name: 'Inferior', id: 'bottom' },
    { name: 'Detallada', id: 'detailed' },
    { name: 'Interesante', id: 'interesting' },
    { name: 'Dock', id: 'dock' },
    { name: 'Bonita', id: 'pretty' },
    { name: 'Minimalista', id: 'minimal' }
  ];

  useEffect(() => {
    if (user && open) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user, open]);

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      updateUser(response.data.user);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (themeId) => {
    const selectedTheme = themeColors.find(t => t.id === themeId);
    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  };

  const handleNavigationChange = (styleId) => {
    setNavigationStyle(styleId);
  };

  const renderThemeSelector = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
        Apariencia
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modifica la apariencia de la app a un color de tu preferencia
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {themeColors.map((theme) => (
          <Grid item xs={2} key={theme.id}>
            <Box
              sx={{
                position: 'relative',
                width: 60,
                height: 60,
                borderRadius: '50%',
                cursor: 'pointer',
                border: currentTheme.id === theme.id ? `3px solid ${theme.primary}` : '2px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: `0 4px 12px ${theme.primary}40`
                }
              }}
              onClick={() => handleThemeChange(theme.id)}
            >
              {/* Círculo dividido en tres partes como en las imágenes */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: currentTheme.id === theme.id ? 
                    `0 0 0 2px ${theme.primary}` : 
                    '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                {/* Parte superior izquierda - Color primario */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '100%',
                    background: theme.primary,
                    clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                  }}
                />
                
                {/* Parte superior derecha - Color secundario */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '50%',
                    height: '50%',
                    background: theme.secondary,
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
                  }}
                />
                
                {/* Parte inferior derecha - Color de fondo */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '50%',
                    height: '50%',
                    background: theme.background,
                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                  }}
                />
              </Box>
              
              {/* Indicador de selección */}
              {currentTheme.id === theme.id && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: theme.primary
                    }}
                  />
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="outlined"
        fullWidth
        sx={{ 
          mb: 4, 
          textTransform: 'none', 
          borderRadius: 3,
          borderColor: 'divider',
          color: 'text.secondary',
          '&:hover': {
            borderColor: currentTheme.primary,
            backgroundColor: `${currentTheme.primary}08`
          }
        }}
        onClick={() => handleThemeChange('classic')}
      >
        Restablecer tema
      </Button>

      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
        Navegación
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Elige el estilo de navegación que más te guste
      </Typography>
      
      <Grid container spacing={1}>
        {navigationStyles.map((style) => (
          <Grid item xs={6} sm={3} key={style.id}>
            <Button
              variant={navigationStyle === style.id ? 'contained' : 'outlined'}
              fullWidth
              size="small"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                py: 1,
                ...(navigationStyle === style.id ? {
                  backgroundColor: currentTheme.primary,
                  '&:hover': {
                    backgroundColor: currentTheme.secondary
                  }
                } : {
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: currentTheme.primary,
                    backgroundColor: `${currentTheme.primary}08`
                  }
                })
              }}
              onClick={() => handleNavigationChange(style.id)}
            >
              {style.name}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Los cambios solo se verán reflejados dentro de un navegador
      </Typography>
    </Box>
  );

  const renderAccountTab = () => (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 120,
            height: 120,
            bgcolor: currentTheme.primary,
            fontSize: '3rem',
            mb: 2
          }}
          src={profileData.avatar}
        >
          {profileData.name.charAt(0).toUpperCase()}
        </Avatar>
        
        <Typography variant="body2" color="text.secondary">
          Sin nombre de usuario
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Correo
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {profileData.email}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Nombre de usuario
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            {profileData.name || 'Sin nombre de usuario'}
          </Typography>
          <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>
            Editar
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        label="Nombre"
        name="name"
        value={profileData.name}
        onChange={handleInputChange}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={profileData.email}
        onChange={handleInputChange}
        sx={{ mb: 3 }}
      />

      <Button
        variant="text"
        color="error"
        fullWidth
        sx={{ textTransform: 'none', mt: 2 }}
      >
        Cerrar sesión
      </Button>
    </Box>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '600px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ minHeight: 'auto' }}
              >
                <Tab
                  icon={<PersonIcon />}
                  label="Cuenta"
                  sx={{ textTransform: 'none', minHeight: 'auto' }}
                />
                <Tab
                  icon={<PaletteIcon />}
                  label="Apariencia"
                  sx={{ textTransform: 'none', minHeight: 'auto' }}
                />
                <Tab
                  icon={<SettingsIcon />}
                  label="Información"
                  sx={{ textTransform: 'none', minHeight: 'auto' }}
                />
              </Tabs>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {activeTab === 0 && renderAccountTab()}
          {activeTab === 1 && renderThemeSelector()}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Información
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Información sobre MindPlan y Desarrolladores
              </Typography>
              
              <Card sx={{ mt: 2, mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">MindPlan Build</Typography>
                  <Typography variant="body2" color="text.secondary">Información</Typography>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">MindPlan Notes</Typography>
                  <Typography variant="body2" color="text.secondary">Información</Typography>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        
        {activeTab === 0 && (
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={onClose} sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ textTransform: 'none' }}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Perfil actualizado exitosamente
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserProfileModal;