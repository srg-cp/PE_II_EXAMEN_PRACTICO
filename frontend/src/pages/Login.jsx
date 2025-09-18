import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en login:', err);
      // Extraer el mensaje específico del servidor
      const errorMessage = err.response?.data?.message || 'Error de conexión. Intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" className="min-h-screen flex items-center">
      <Paper elevation={3} className="w-full p-8 rounded-3xl">
        <Box className="text-center mb-6">
          <Typography component="h1" variant="h4" className="font-bold text-primary-600 mb-2">
            MindPlan
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Planeamiento Estratégico de TI
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className="mb-4"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className="mb-6"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            className="mb-4 py-3"
          >
            {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
          <Box className="text-center">
            <Link to="/register" className="text-primary-600 hover:underline">
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;