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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const InviteParticipantsModal = ({ open, onClose, projectId, currentMembers = [] }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Buscar usuarios disponibles
  const searchUsers = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setUserOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/search-users?query=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // El backend devuelve { users: [...] }, así que necesitamos acceder a response.data.users
      const availableUsers = response.data.users || [];
      
      // Filtrar usuarios que ya son miembros del proyecto
      const currentMemberIds = currentMembers.map(member => member._id || member.id);
      const filteredUsers = availableUsers.filter(
        user => !currentMemberIds.includes(user._id || user.id)
      );
      
      setUserOptions(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Error al buscar usuarios');
    } finally {
      setSearchLoading(false);
    }
  };

  // Enviar invitaciones
  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      setError('Selecciona al menos un usuario para invitar');
      return;
    }

    setInviting(true);
    setError('');
    setSuccess('');

    try {
      const results = [];
      const errors = [];

      // Invitar usuarios uno por uno usando la API existente
      for (const user of selectedUsers) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}/members`,
            { email: user.email },
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }
          );
          results.push({ user: user.name, success: true });
        } catch (err) {
          const errorMsg = err.response?.data?.message || 'Error invitando usuario';
          errors.push({ user: user.name, error: errorMsg });
        }
      }

      if (results.length > 0) {
        setSuccess(`${results.length} usuario(s) invitado(s) exitosamente`);
        setSelectedUsers([]);
        
        // Llamar callback si existe
        if (onInviteSuccess) {
          onInviteSuccess();
        }
      }

      if (errors.length > 0) {
        const errorMessages = errors.map(e => `${e.user}: ${e.error}`).join(', ');
        setError(`Errores: ${errorMessages}`);
      }

    } catch (error) {
      console.error('Error invitando usuarios:', error);
      setError('Error inesperado al invitar usuarios');
    } finally {
      setInviting(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setUserOptions([]);
    setError('');
    setSuccess('');
    onClose();
  };

  const removeSelectedUser = (userToRemove) => {
    setSelectedUsers(prev => prev.filter(user => 
      (user._id || user.id) !== (userToRemove._id || userToRemove.id)
    ));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '400px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Invitar Participantes</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            Busca y selecciona usuarios para invitar a colaborar en este proyecto.
          </Typography>

          {/* Buscador de usuarios */}
          <Autocomplete
            multiple
            options={userOptions}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={selectedUsers}
            onChange={(event, newValue) => setSelectedUsers(newValue)}
            onInputChange={(event, newInputValue) => searchUsers(newInputValue)}
            loading={searchLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar usuarios"
                placeholder="Escribe nombre o email..."
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
                    onDelete={() => removeSelectedUser(option)}
                  />
                );
              })
            }
          />

          {/* Lista de usuarios seleccionados */}
          {selectedUsers.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Usuarios seleccionados ({selectedUsers.length})
              </Typography>
              <List dense>
                {selectedUsers.map((user, index) => (
                  <React.Fragment key={user._id || user.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar src={user.avatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.email}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => removeSelectedUser(user)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < selectedUsers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={inviting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleInvite}
          disabled={selectedUsers.length === 0 || inviting}
          startIcon={inviting ? <CircularProgress size={20} /> : <SendIcon />}
        >
          {inviting ? 'Enviando...' : `Invitar ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteParticipantsModal;