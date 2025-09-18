import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Container,
  Tab,
  Tabs
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCurrentTab = () => {
    if (location.pathname === '/dashboard') return 0;
    if (location.pathname.startsWith('/projects')) return 1;
    return 0;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h5" 
              component={Link} 
              to="/dashboard"
              sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                textDecoration: 'none',
                mr: 4
              }}
            >
              MindPlan
            </Typography>
            
            <Tabs 
              value={getCurrentTab()} 
              sx={{ minHeight: 'auto' }}
              TabIndicatorProps={{
                sx: { backgroundColor: 'primary.main' }
              }}
            >
              <Tab 
                icon={<DashboardIcon />}
                label="Dashboard"
                component={Link}
                to="/dashboard"
                sx={{ 
                  minHeight: 'auto',
                  textTransform: 'none',
                  color: 'text.primary',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                }}
              />
              <Tab 
                icon={<FolderIcon />}
                label="Proyectos"
                component={Link}
                to="/projects"
                sx={{ 
                  minHeight: 'auto',
                  textTransform: 'none',
                  color: 'text.primary',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                }}
              />
            </Tabs>
          </Box>

          {/* User Info and Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{user?.name?.charAt(0)}</Avatar>}
              label={`Hola, ${user?.name}`}
              variant="outlined"
              color="primary"
            />
            
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ textTransform: 'none' }}
            >
              Cerrar Sesión
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;