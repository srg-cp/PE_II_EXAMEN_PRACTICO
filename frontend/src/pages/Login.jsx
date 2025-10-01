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
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  LoginRounded as LoginIcon,
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  Brightness4 as BrightnessIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { currentTheme } = useTheme();
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
      const errorMessage = err.response?.data?.message || 'Error de conexión. Intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${currentTheme.primary}15 0%, ${currentTheme.secondary}10 50%, ${currentTheme.primary}08 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, ${currentTheme.primary}08 0%, transparent 70%)`,
          animation: 'float 20s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -30px) rotate(120deg)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(240deg)' }
        }
      }}
    >
      {/* Elementos decorativos flotantes */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${currentTheme.primary}20, ${currentTheme.secondary}15)`,
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
            '50%': { transform: 'scale(1.1)', opacity: 0.4 }
          }
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: 60,
          height: 60,
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: `linear-gradient(225deg, ${currentTheme.secondary}25, ${currentTheme.primary}20)`,
          animation: 'morph 6s ease-in-out infinite',
          '@keyframes morph': {
            '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
            '25%': { borderRadius: '58% 42% 75% 25% / 76% 46% 54% 24%' },
            '50%': { borderRadius: '50% 50% 33% 67% / 55% 27% 73% 45%' },
            '75%': { borderRadius: '33% 67% 58% 42% / 63% 68% 32% 37%' }
          }
        }}
      />

      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              padding: 6,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `0 32px 64px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary}, ${currentTheme.primary})`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite',
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '-200% 0' },
                  '100%': { backgroundPosition: '200% 0' }
                }
              }
            }}
          >
            {/* Header con logo y título */}
            <Slide direction="down" in timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: `0 8px 32px ${currentTheme.primary}40`,
                    animation: 'glow 2s ease-in-out infinite alternate',
                    '@keyframes glow': {
                      '0%': { boxShadow: `0 8px 32px ${currentTheme.primary}40` },
                      '100%': { boxShadow: `0 12px 48px ${currentTheme.primary}60` }
                    }
                  }}
                >
                  <BrightnessIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  MindPlan
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 3,
                    opacity: 0.8
                  }}
                >
                  Planeamiento Estratégico de TI
                </Typography>

                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${currentTheme.primary}08, ${currentTheme.secondary}05)`,
                    border: `1px solid ${currentTheme.primary}20`,
                    borderRadius: 3,
                    mb: 2
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <LoginIcon sx={{ color: currentTheme.primary }} />
                      <Typography variant="h5" sx={{ fontWeight: 600, color: currentTheme.primary }}>
                        Iniciar Sesión
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Accede a tu cuenta para continuar con tus proyectos
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Slide>

            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    '& .MuiAlert-icon': {
                      fontSize: 24
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Slide direction="up" in timeout={1200}>
              <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountIcon sx={{ color: currentTheme.primary, mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: currentTheme.primary }}>
                      Correo Electrónico
                    </Typography>
                  </Box>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="tu@email.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: currentTheme.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px rgba(0, 0, 0, 0.1)`
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${currentTheme.primary}20`
                        }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SecurityIcon sx={{ color: currentTheme.primary, mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: currentTheme.primary }}>
                      Contraseña
                    </Typography>
                  </Box>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="••••••••"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: currentTheme.primary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              color: currentTheme.primary,
                              '&:hover': {
                                backgroundColor: `${currentTheme.primary}10`
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px rgba(0, 0, 0, 0.1)`
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${currentTheme.primary}20`
                        }
                      }
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    height: 56,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                    boxShadow: `0 8px 32px ${currentTheme.primary}40`,
                    mb: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 12px 48px ${currentTheme.primary}50`,
                      '&::before': {
                        opacity: 1
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                      opacity: 0
                    },
                    '&:hover::before': {
                      left: '100%',
                      opacity: 1
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={28} sx={{ color: 'white' }} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LoginIcon />
                      Iniciar Sesión
                    </Box>
                  )}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Chip
                    label="¿Nuevo en MindPlan?"
                    sx={{
                      backgroundColor: `${currentTheme.primary}10`,
                      color: currentTheme.primary,
                      fontWeight: 600
                    }}
                  />
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    fullWidth
                    sx={{
                      height: 48,
                      borderRadius: 4,
                      borderColor: currentTheme.primary,
                      color: currentTheme.primary,
                      fontWeight: 600,
                      textTransform: 'none',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: `${currentTheme.primary}08`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${currentTheme.primary}20`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Crear cuenta nueva
                  </Button>
                </Box>
              </Box>
            </Slide>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;