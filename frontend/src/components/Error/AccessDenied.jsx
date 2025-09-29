import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Avatar,
  Stack,
  useTheme
} from '@mui/material';
import {
  Block as BlockIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AccessDenied = ({ 
  title = "Acceso Denegado", 
  message = "Ya no tienes permisos para acceder a este proyecto",
  showBackButton = true,
  showHomeButton = true 
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.contrastText
            }}
          >
            <BlockIcon sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            {title}
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              lineHeight: 1.6,
              fontSize: '1.1rem'
            }}
          >
            {message}
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 4,
              fontStyle: 'italic'
            }}
          >
            Es posible que el propietario del proyecto haya revocado tu acceso o que hayas sido removido del proyecto.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          {showBackButton && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{
                minWidth: 140,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Volver
            </Button>
          )}
          
          {showHomeButton && (
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                minWidth: 140,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              Ir al Dashboard
            </Button>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default AccessDenied;