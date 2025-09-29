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

const InviteParticipantsModal = ({ open, onClose, projectId, currentMembers = [], onInviteSuccess }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);

  useEffect(() => {
    if (open && projectId) {
      fetchProjectMembers();
    }
  }, [open, projectId]);

  const fetchProjectMembers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const project = response.data;
      const allMembers = [];
      
      if (project.owner) {
        allMembers.push(project.owner);
      }
      
      if (project.members) {
        project.members.forEach(member => {
          if (member._id !== project.owner?._id) {
            allMembers.push(member);
          }
        });
      }
      
      setProjectMembers(allMembers);
    } catch (error) {
      console.error('Error obteniendo miembros del proyecto:', error);
    }
  };

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
      
      const availableUsers = response.data.users || [];
      
      // Filtrar usuarios que ya son miembros del proyecto
      const currentMemberIds = projectMembers.map(member => member._id || member.id);
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

      // Invitar usuarios uno por uno
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
        
        // Actualizar la lista de miembros del proyecto
        await fetchProjectMembers();
        
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
    setProjectMembers([]);
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
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '500px',
          maxHeight: '90vh'
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
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
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

        {/* Miembros actuales del proyecto */}
        {projectMembers.length > 0 && (
          <Box sx={{ flex: '0 0 auto' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Miembros actuales del proyecto ({projectMembers.length})
            </Typography>
            <Box
              sx={{
                maxHeight: '400px',
                overflow: 'auto',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                // Estilos de scrollbar Material Design 3
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.5)',
                  },
                },
                // Para Firefox
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.3) rgba(0,0,0,0.1)',
              }}
            >
              <List dense>
                {projectMembers.map((member, index) => (
                  <React.Fragment key={member._id || member.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar src={member.avatar}>
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={member.email}
                      />
                      <Chip 
                        label={index === 0 ? "Propietario" : "Miembro"} 
                        size="small" 
                        color={index === 0 ? "primary" : "default"}
                      />
                    </ListItem>
                    {index < projectMembers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Box>
        )}

        <Divider />

        <Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Invitar nuevos participantes
          </Typography>

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
            // Evitar duplicados comparando por ID
            isOptionEqualToValue={(option, value) => 
              (option._id || option.id) === (value._id || value.id)
            }
            // Deshabilitar opciones ya seleccionadas
            getOptionDisabled={(option) => 
              selectedUsers.some(selected => 
                (selected._id || selected.id) === (option._id || option.id)
              )
            }
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
            renderOption={(props, option, { selected }) => {
              const { key, ...otherProps } = props;
              const isDisabled = selectedUsers.some(selected => 
                (selected._id || selected.id) === (option._id || option.id)
              );
              
              return (
                <Box 
                  component="li" 
                  key={key} 
                  {...otherProps} 
                  display="flex" 
                  alignItems="center" 
                  gap={1}
                  sx={{
                    opacity: isDisabled ? 0.5 : 1,
                    pointerEvents: isDisabled ? 'none' : 'auto'
                  }}
                >
                  <Avatar src={option.avatar} sx={{ width: 32, height: 32 }}>
                    {option.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                  {isDisabled && (
                    <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
                      Ya seleccionado
                    </Typography>
                  )}
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
            <Box sx={{ flex: '1 1 auto', minHeight: 0 }}>
              <Typography variant="subtitle2" gutterBottom>
                Usuarios seleccionados para invitar ({selectedUsers.length})
              </Typography>
              <Box
                sx={{
                  maxHeight: '150px',
                  overflow: 'auto',
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  // Estilos de scrollbar Material Design 3
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    '&:hover': {
                      background: 'rgba(0,0,0,0.5)',
                    },
                  },
                  // Para Firefox
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,0,0,0.3) rgba(0,0,0,0.1)',
                }}
              >
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