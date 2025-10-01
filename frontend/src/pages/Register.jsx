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
  Chip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  CheckCircle as CheckIcon,
  Brightness4 as BrightnessIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const { register } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const steps = ['Información Personal', 'Credenciales', 'Confirmación'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Actualizar step automáticamente
    if (name === 'name' && value.length > 0 && activeStep === 0) {
      setActiveStep(1);
    } else if (name === 'email' && value.length > 0 && activeStep === 1) {
      setActiveStep(2);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return newErrors;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength < 50) return 'error';
    if (strength < 75) return 'warning';
    return 'success';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.message || 'Error al registrar usuario' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${currentTheme.secondary}15 0%, ${currentTheme.primary}10 50%, ${currentTheme.secondary}08 100%)`,
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
          right: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, ${currentTheme.secondary}08 0%, transparent 70%)`,
          animation: 'floatReverse 25s ease-in-out infinite',
        },
        '@keyframes floatReverse': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(-30px, 30px) rotate(-120deg)' },
          '66%': { transform: 'translate(20px, -20px) rotate(-240deg)' }
        }
      }}
    >
      {/* Elementos decorativos */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${currentTheme.secondary}20, ${currentTheme.primary}15)`,
          animation: 'breathe 5s ease-in-out infinite',
          '@keyframes breathe': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
            '50%': { transform: 'scale(1.2)', opacity: 0.3 }
          }
        }}
      />

      <Container component="main" maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={32}
            sx={{
              padding: 6,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `0 40px 80px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${currentTheme.secondary}, ${currentTheme.primary}, ${currentTheme.secondary})`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite',
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '-200% 0' },
                  '100%': { backgroundPosition: '200% 0' }
                }
              }
            }}
          >
            {/* Header */}
            <Slide direction="down" in timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${currentTheme.secondary}, ${currentTheme.primary})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: `0 12px 40px ${currentTheme.secondary}40`,
                    animation: 'pulse 3s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', boxShadow: `0 12px 40px ${currentTheme.secondary}40` },
                      '50%': { transform: 'scale(1.05)', boxShadow: `0 16px 60px ${currentTheme.secondary}60` }
                    }
                  }}
                >
                  <BrightnessIcon sx={{ fontSize: 45, color: 'white' }} />
                </Box>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${currentTheme.secondary}, ${currentTheme.primary})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  MindPlan
                </Typography>
                
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, mb: 3 }}>
                  Planeamiento Estratégico de TI
                </Typography>

                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${currentTheme.secondary}08, ${currentTheme.primary}05)`,
                    border: `1px solid ${currentTheme.secondary}20`,
                    borderRadius: 3,
                    mb: 3
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <PersonAddIcon sx={{ color: currentTheme.secondary }} />
                      <Typography variant="h5" sx={{ fontWeight: 600, color: currentTheme.secondary }}>
                        Crear Cuenta Nueva
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Únete a MindPlan y comienza a planificar estratégicamente
                    </Typography>
                  </CardContent>
                </Card>

                {/* Stepper */}
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          '& .MuiStepLabel-label': {
                            fontSize: '0.875rem',
                            fontWeight: 600
                          },
                          '& .MuiStepIcon-root': {
                            color: index <= activeStep ? currentTheme.primary : 'grey.300',
                            fontSize: '1.5rem'
                          }
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </Slide>

            {errors.submit && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                  {errors.submit}
                </Alert>
              </Fade>
            )}

            <Slide direction="up" in timeout={1200}>
              <Box component="form" onSubmit={handleSubmit}>
                {/* Nombre */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ color: currentTheme.secondary, mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: currentTheme.secondary }}>
                      Nombre Completo
                    </Typography>
                    {formData.name && <CheckIcon sx={{ color: 'success.main', ml: 1, fontSize: 20 }} />}
                  </Box>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.name}
                    helperText={errors.name}
                    placeholder="Tu nombre completo"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountIcon sx={{ color: currentTheme.secondary }} />
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
                          boxShadow: `0 8px 25px ${currentTheme.secondary}20`
                        }
                      }
                    }}
                  />
                </Box>

                {/* Email */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ color: currentTheme.secondary, mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: currentTheme.secondary }}>
                      Correo Electrónico
                    </Typography>
                    {formData.email && /\S+@\S+\.\S+/.test(formData.email) && (
                      <CheckIcon sx={{ color: 'success.main', ml: 1, fontSize: 20 }} />
                    )}
                  </Box>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.email}
                    helperText={errors.email}
                    placeholder="tu@email.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: currentTheme.secondary }} />
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
                          boxShadow: `0 8px 25px ${currentTheme.secondary}20`
                        }
                      }
                    }}
                  />
                </Box>

                {/* Contraseña */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SecurityIcon sx={{ color: currentTheme.secondary, mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: currentTheme.secondary }}>
                      Contraseña
                    </Typography>
                    {formData.password && getPasswordStrength() >= 75 && (
                      <CheckIcon sx={{ color: 'success.main', ml: 1, fontSize: 20 }} />
                    )}
                  </Box>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.password}
                    helperText={errors.password}
                    placeholder="Mínimo 6 caracteres"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: currentTheme.secondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: currentTheme.secondary }}
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
                          boxShadow: `0 8px 25px ${currentTheme.secondary}20`
                        }
                      }
                    }}
                  />
                  {formData.password && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={getPasswordStrength()}
                        color={getPasswordStrengthColor()}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color={`${getPasswordStrengthColor()}.main`} sx={{ mt: 0.5, display: 'block' }}>
                        Seguridad: {getPasswordStrength() < 50 ? 'Débil' : getPasswordStrength() < 75 ? 'Media' : 'Fuerte'}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Confirmar Contraseña */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LockIcon sx={{ color: currentTheme.secondary, mr: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: currentTheme.secondary }}>
                      Confirmar Contraseña
                    </Typography>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <CheckIcon sx={{ color: 'success.main', ml: 1, fontSize: 20 }} />
                    )}
                  </Box>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    placeholder="Repite tu contraseña"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: currentTheme.secondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: currentTheme.secondary }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                          boxShadow: `0 8px 25px ${currentTheme.secondary}20`
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
                    background: `linear-gradient(135deg, ${currentTheme.secondary}, ${currentTheme.primary})`,
                    boxShadow: `0 8px 32px ${currentTheme.secondary}40`,
                    mb: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 12px 48px ${currentTheme.secondary}50`,
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
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={28} sx={{ color: 'white' }} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonAddIcon />
                      Crear Mi Cuenta
                    </Box>
                  )}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Chip
                    label="¿Ya tienes cuenta?"
                    sx={{
                      backgroundColor: `${currentTheme.secondary}10`,
                      color: currentTheme.secondary,
                      fontWeight: 600
                    }}
                  />
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    fullWidth
                    sx={{
                      height: 48,
                      borderRadius: 4,
                      borderColor: currentTheme.secondary,
                      color: currentTheme.secondary,
                      fontWeight: 600,
                      textTransform: 'none',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: `${currentTheme.secondary}08`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${currentTheme.secondary}20`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Iniciar Sesión
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

export default Register;