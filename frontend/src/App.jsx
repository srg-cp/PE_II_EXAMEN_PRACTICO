import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Layout/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectView from './components/ProjectView';
import DocumentEditor from './pages/DocumentEditor';
import Projects from './pages/Projects';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';

// Tema Material Design 3
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750a4',
      light: '#9a82db',
      dark: '#4f378b',
    },
    secondary: {
      main: '#625b71',
      light: '#8e8ca0',
      dark: '#484459',
    },
    background: {
      default: '#fffbfe',
      paper: '#f7f2fa',
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

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <SocketProvider>
                    <Navbar />
                    <Dashboard />
                  </SocketProvider>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <SocketProvider>
                    <Navbar />
                    <Dashboard />
                  </SocketProvider>
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <SocketProvider>
                    <Navbar />
                    <Projects />
                  </SocketProvider>
                </ProtectedRoute>
              } />
              <Route path="/project/:projectId" element={
                <ProtectedRoute>
                  <SocketProvider>
                    <Navbar />
                    <ProjectView />
                  </SocketProvider>
                </ProtectedRoute>
              } />
              <Route path="/document/:id" element={
                <ProtectedRoute>
                  <SocketProvider>
                    <Navbar />
                    <DocumentEditor />
                  </SocketProvider>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;