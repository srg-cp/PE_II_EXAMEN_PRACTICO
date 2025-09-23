import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Box,
  Typography,
  Chip,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  History as HistoryIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import CollaborativeCursors from '../CollaborativeCursors/CollaborativeCursors';

const CollaborativeEditor = ({ projectId, documentId, initialContent = '', title, type }) => {
  const [content, setContent] = useState(initialContent);
  const [activeUsers, setActiveUsers] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const quillRef = useRef(null);
  const { socket, editDocument } = useSocket();
  const { user } = useAuth();
  const saveTimeoutRef = useRef(null);
  const [userCursors, setUserCursors] = useState([]);
  const [editorBounds, setEditorBounds] = useState(null);

  // Configuración del editor
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: false
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'align',
    'link', 'image', 'color', 'background'
  ];

  useEffect(() => {
    if (socket) {
      // Escuchar actualizaciones del documento
      socket.on('document-updated', (data) => {
        if (data.documentId === documentId && data.updatedBy.id !== user.id) {
          setContent(data.content);
          setLastSaved(new Date());
        }
      });

      // Escuchar cursores de otros usuarios - MEJORADO
      socket.on('cursor-updated', (data) => {
        if (data.documentId === documentId) {
          setUserCursors(prev => {
            const filtered = prev.filter(cursor => cursor.userId !== data.userId);
            return [...filtered, {
              userId: data.userId,
              userName: data.userName,
              position: data.position,
              timestamp: Date.now()
            }];
          });
          
          // Remover cursores inactivos después de 5 segundos
          setTimeout(() => {
            setUserCursors(prev => 
              prev.filter(cursor => 
                cursor.userId !== data.userId || 
                Date.now() - cursor.timestamp < 5000
              )
            );
          }, 5000);
        }
      });

      return () => {
        socket.off('document-updated');
        socket.off('cursor-updated');
        socket.off('user-joined');
        socket.off('user-left');
      };
    }
  }, [socket, documentId, user.id]);

  const updateUserCursor = (data) => {
    // Implementar visualización de cursores de otros usuarios
    // Esto requeriría una implementación más avanzada con Quill
    console.log('Cursor actualizado:', data);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    setSaving(true);

    // Debounce para evitar demasiadas actualizaciones
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      editDocument(projectId, documentId, newContent, type);
      setSaving(false);
      setLastSaved(new Date());
    }, 1000);
  };

  // Mejorar el manejo de selección para enviar posición del cursor
  const handleSelectionChange = (range, source, editor) => {
    if (range && socket && source === 'user') {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const bounds = quill.getBounds(range.index);
        const editorElement = quill.container;
        const editorRect = editorElement.getBoundingClientRect();
        
        // Calcular posición relativa al editor
        const position = {
          x: bounds.left,
          y: bounds.top + bounds.height,
          index: range.index,
          length: range.length
        };

        // Enviar posición del cursor
        socket.emit('cursor-position', {
          projectId,
          documentId,
          position
        });
      }
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'No guardado';
    return `Guardado ${lastSaved.toLocaleTimeString()}`;
  };

  return (
    <Paper className="h-full flex flex-col relative">
      {/* Header del editor */}
      <Box className="flex justify-between items-center p-4 border-b">
        <Box>
          <Typography variant="h5" className="font-semibold">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {saving ? 'Guardando...' : formatLastSaved()}
          </Typography>
        </Box>

        <Box className="flex items-center gap-2">
          {/* Usuarios activos */}
          {activeUsers.length > 0 && (
            <Tooltip title={`${activeUsers.length} usuarios conectados`}>
              <Box className="flex items-center gap-1">
                <PeopleIcon fontSize="small" />
                <Typography variant="body2">{activeUsers.length}</Typography>
              </Box>
            </Tooltip>
          )}

          {/* Indicadores de usuarios */}
          <Box className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((activeUser, index) => (
              <Chip
                key={activeUser.userId}
                label={activeUser.userName.charAt(0).toUpperCase()}
                size="small"
                className="w-8 h-8"
                style={{
                  backgroundColor: `hsl(${index * 137.5}, 70%, 50%)`,
                  color: 'white',
                  zIndex: activeUsers.length - index
                }}
              />
            ))}
            {activeUsers.length > 3 && (
              <Chip
                label={`+${activeUsers.length - 3}`}
                size="small"
                className="w-8 h-8"
              />
            )}
          </Box>

          <IconButton size="small">
            <HistoryIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Editor con cursores colaborativos */}
      <Box className="flex-1 overflow-hidden relative">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleContentChange}
          onChangeSelection={handleSelectionChange}
          modules={modules}
          formats={formats}
          className="h-full"
          style={{
            height: 'calc(100% - 42px)',
          }}
        />
        
        {/* Overlay de cursores colaborativos */}
        <CollaborativeCursors cursors={userCursors} />
      </Box>
    </Paper>
  );
};

export default CollaborativeEditor;