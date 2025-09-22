import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themeConfigs = {
  classic: { primary: '#6750a4', secondary: '#625b71', background: '#f7f2fa' },
  blue: { primary: '#1976d2', secondary: '#1565c0', background: '#e3f2fd' },
  green: { primary: '#388e3c', secondary: '#2e7d32', background: '#e8f5e8' },
  orange: { primary: '#f57c00', secondary: '#ef6c00', background: '#fff3e0' },
  cyan: { primary: '#0097a7', secondary: '#00838f', background: '#e0f2f1' },
  purple: { primary: '#7b1fa2', secondary: '#6a1b9a', background: '#f3e5f5' },
  violet: { primary: '#5e35b1', secondary: '#512da8', background: '#ede7f6' },
  darkblue: { primary: '#303f9f', secondary: '#283593', background: '#e8eaf6' },
  red: { primary: '#d32f2f', secondary: '#c62828', background: '#ffebee' },
  amber: { primary: '#ff8f00', secondary: '#ff6f00', background: '#fff8e1' },
  pink: { primary: '#c2185b', secondary: '#ad1457', background: '#fce4ec' },
  minimal: { primary: '#424242', secondary: '#616161', background: '#fafafa' }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('mindplan-theme');
    return saved ? JSON.parse(saved) : { id: 'classic', ...themeConfigs.classic };
  });
  
  const [navigationStyle, setNavigationStyle] = useState(() => {
    return localStorage.getItem('mindplan-navigation') || 'modern';
  });

  useEffect(() => {
    localStorage.setItem('mindplan-theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('mindplan-navigation', navigationStyle);
  }, [navigationStyle]);

  const setTheme = (themeConfig) => {
    setCurrentTheme({
      id: themeConfig.id,
      primary: themeConfig.primary,
      secondary: themeConfig.secondary,
      background: themeConfig.background
    });
  };

  const muiTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: currentTheme.primary,
        light: currentTheme.primary + '80',
        dark: currentTheme.primary + 'CC',
      },
      secondary: {
        main: currentTheme.secondary,
        light: currentTheme.secondary + '80',
        dark: currentTheme.secondary + 'CC',
      },
      background: {
        default: currentTheme.background || '#fffbfe',
        paper: currentTheme.background || '#f7f2fa',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 20,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          },
        },
      },
    },
  });

  const value = {
    currentTheme,
    setTheme,
    navigationStyle,
    setNavigationStyle,
    muiTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};