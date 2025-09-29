import { useState, useCallback } from 'react';

export const useAccessControl = () => {
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessError, setAccessError] = useState(null);

  const handleAccessError = useCallback((error) => {
    if (error.response?.status === 403) {
      setAccessDenied(true);
      setAccessError({
        title: "Acceso Denegado",
        message: error.response?.data?.message || "Ya no tienes permisos para acceder a este proyecto"
      });
      return true; // Indica que se manejó el error
    }
    return false; // No se manejó el error
  }, []);

  const resetAccessError = useCallback(() => {
    setAccessDenied(false);
    setAccessError(null);
  }, []);

  return {
    accessDenied,
    accessError,
    handleAccessError,
    resetAccessError
  };
};