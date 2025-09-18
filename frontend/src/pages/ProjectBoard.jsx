import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Tabs, Tab } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import KanbanBoard from '../components/Board/KanbanBoard';
import axios from 'axios';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
    fetchBoards();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/boards/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const createNewBoard = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/boards`,
        {
          name: `Tablero ${boards.length + 1}`,
          projectId: projectId
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setBoards([...boards, response.data]);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Cargando proyecto...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {project?.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {project?.description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={createNewBoard}
        >
          Nuevo Tablero
        </Button>
      </Box>

      {boards.length > 0 ? (
        <Box>
          <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            {boards.map((board, index) => (
              <Tab key={board._id} label={board.name} />
            ))}
          </Tabs>
          
          {boards[currentTab] && (
            <KanbanBoard 
              boardId={boards[currentTab]._id} 
              projectId={projectId}
            />
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay tableros en este proyecto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea tu primer tablero para comenzar a organizar las tareas
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createNewBoard}
          >
            Crear Primer Tablero
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ProjectBoard;