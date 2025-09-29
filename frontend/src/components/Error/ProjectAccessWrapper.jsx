import React, { useState, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import axios from 'axios';
import AccessDenied from './AccessDenied';
import { useAccessControl } from '../../hooks/useAccessControl';

const ProjectAccessWrapper = ({ 
  projectId, 
  children, 
  checkAccess = true,
  loadingComponent = null 
}) => {
  const [loading, setLoading] = useState(checkAccess);
  const [hasAccess, setHasAccess] = useState(!checkAccess);
  const { accessDenied, accessError, handleAccessError } = useAccessControl();

  useEffect(() => {
    if (checkAccess && projectId) {
      verifyAccess();
    }
  }, [projectId, checkAccess]);

  const verifyAccess = async () => {
    try {
      await axios.get(`/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setHasAccess(true);
    } catch (error) {
      if (!handleAccessError(error)) {
        console.error('Error verificando acceso:', error);
        setHasAccess(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return loadingComponent || (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (accessDenied) {
    return (
      <AccessDenied
        title={accessError?.title}
        message={accessError?.message}
      />
    );
  }

  if (!hasAccess && checkAccess) {
    return (
      <AccessDenied
        title="Proyecto no encontrado"
        message="El proyecto que buscas no existe o no tienes permisos para acceder a él"
      />
    );
  }

  return children;
};

export default ProjectAccessWrapper;