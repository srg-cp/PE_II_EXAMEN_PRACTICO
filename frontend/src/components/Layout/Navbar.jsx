import React, { useState } from 'react';
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
  Tabs,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import UserProfileModal from '../UserProfile/UserProfileModal';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenProfile = () => {
    setProfileOpen(true);
    handleMenuClose();
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

          {/* User Info and Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleProfileClick}
              sx={{ p: 0 }}
            >
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleOpenProfile}>
                <PersonIcon sx={{ mr: 1 }} />
                Mi Perfil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
      
      <UserProfileModal 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />
    </AppBar>
  );
};

export default Navbar;