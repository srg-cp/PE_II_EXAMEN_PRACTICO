import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const FodaSection = ({ projectId, sectionData, onDataUpdate }) => {
  const [fodaData, setFodaData] = useState({
    fortalezas: [],
    oportunidades: [],
    debilidades: [],
    amenazas: []
  });

  useEffect(() => {
    if (sectionData?.content) {
      setFodaData(sectionData.content);
    }
  }, [sectionData]);

  const updateFodaData = (newFodaData) => {
    setFodaData(newFodaData);
    onDataUpdate({ ...sectionData, content: newFodaData });
  };

  const addItem = (category) => {
    const newFodaData = {
      ...fodaData,
      [category]: [...fodaData[category], '']
    };
    updateFodaData(newFodaData);
  };

  const removeItem = (category, index) => {
    const newFodaData = {
      ...fodaData,
      [category]: fodaData[category].filter((_, i) => i !== index)
    };
    updateFodaData(newFodaData);
  };

  const updateItem = (category, index, value) => {
    const newFodaData = {
      ...fodaData,
      [category]: fodaData[category].map((item, i) => i === index ? value : item)
    };
    updateFodaData(newFodaData);
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  const fodaCategories = [
    {
      key: 'fortalezas',
      title: 'FORTALEZAS',
      color: '#e8f5e8',
      headerColor: '#c8e6c9',
      items: fodaData.fortalezas
    },
    {
      key: 'oportunidades',
      title: 'OPORTUNIDADES',
      color: '#fff3e0',
      headerColor: '#ffcc02',
      items: fodaData.oportunidades
    },
    {
      key: 'debilidades',
      title: 'DEBILIDADES',
      color: '#fff8e1',
      headerColor: '#fff176',
      items: fodaData.debilidades
    },
    {
      key: 'amenazas',
      title: 'AMENAZAS',
      color: '#ffebee',
      headerColor: '#ef9a9a',
      items: fodaData.amenazas
    }
  ];

  return (
    <Box>
      {/* Título del análisis FODA */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h5" component="h3" sx={{ 
          bgcolor: '#1976d2', 
          color: 'white', 
          p: 2, 
          borderRadius: 1 
        }}>
          ANÁLISIS FODA
        </Typography>
      </Box>

      {/* Matriz FODA */}
      <Grid container spacing={2}>
        {fodaCategories.map((category) => (
          <Grid item xs={12} md={6} key={category.key}>
            <Card sx={{ height: '100%', bgcolor: category.color }}>
              <CardHeader
                title={category.title}
                sx={{ 
                  bgcolor: category.headerColor, 
                  textAlign: 'center',
                  '& .MuiCardHeader-title': {
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }
                }}
                action={
                  <IconButton onClick={() => addItem(category.key)}>
                    <AddIcon />
                  </IconButton>
                }
              />
              <CardContent sx={{ height: 350, overflow: 'auto' }}>
                {category.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, position: 'relative' }}>
                    <IconButton
                      size="small"
                      onClick={() => removeItem(category.key, index)}
                      sx={{ position: 'absolute', top: -8, right: -8, zIndex: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <ReactQuill
                      value={item}
                      onChange={(value) => updateItem(category.key, index, value)}
                      modules={quillModules}
                      theme="snow"
                      placeholder={`${category.title.toLowerCase()} ${index + 1}...`}
                      style={{ minHeight: '80px' }}
                    />
                  </Box>
                ))}
                {category.items.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No hay {category.title.toLowerCase()} definidas
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FodaSection;