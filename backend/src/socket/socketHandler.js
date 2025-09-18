const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Board = require('../models/Board');
const Document = require('../models/Document');
const ChangeHistory = require('../models/ChangeHistory');

// Almacenar usuarios activos por proyecto
const activeUsers = new Map(); // projectId -> Set of user objects

const socketHandler = (io) => {
  // Middleware de autenticación para sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Token no proporcionado'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Usuario conectado: ${socket.user.name} (${socket.userId})`);

    // Unirse a un proyecto
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      socket.currentProject = projectId;
      
      // Agregar usuario a la lista de activos
      if (!activeUsers.has(projectId)) {
        activeUsers.set(projectId, new Set());
      }
      
      const projectUsers = activeUsers.get(projectId);
      projectUsers.add({
        id: socket.userId,
        name: socket.user.name,
        email: socket.user.email,
        avatar: socket.user.avatar || null,
        socketId: socket.id,
        joinedAt: new Date()
      });
      
      console.log(`👥 Usuario ${socket.user.name} se unió al proyecto ${projectId}`);
      
      // Enviar lista actualizada de usuarios conectados a todos
      const usersList = Array.from(projectUsers);
      io.to(`project-${projectId}`).emit('active-users-updated', {
        users: usersList,
        totalUsers: usersList.length
      });
      
      // Notificar a otros usuarios del proyecto
      socket.to(`project-${projectId}`).emit('user-joined', {
        userId: socket.userId,
        userName: socket.user.name,
        userEmail: socket.user.email,
        avatar: socket.user.avatar
      });
    });

    // Salir de un proyecto
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      
      // Remover usuario de la lista de activos
      if (activeUsers.has(projectId)) {
        const projectUsers = activeUsers.get(projectId);
        projectUsers.forEach(user => {
          if (user.socketId === socket.id) {
            projectUsers.delete(user);
          }
        });
        
        // Enviar lista actualizada
        const usersList = Array.from(projectUsers);
        io.to(`project-${projectId}`).emit('active-users-updated', {
          users: usersList,
          totalUsers: usersList.length
        });
      }
      
      console.log(`👋 Usuario ${socket.user.name} salió del proyecto ${projectId}`);
      
      // Notificar a otros usuarios del proyecto
      socket.to(`project-${projectId}`).emit('user-left', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Nuevo evento para actualización de secciones del proyecto
    socket.on('project-section-update', async (data) => {
      try {
        const { projectId, sectionKey, content, changeType } = data;
        
        // Obtener contenido anterior para comparación
        const project = await Project.findById(projectId);
        const previousContent = project?.sections?.[sectionKey];
        
        // Crear entrada persistente en el historial
        const historyEntry = new ChangeHistory({
          projectId,
          sectionKey,
          changeType: changeType || 'edit',
          content: {
            before: previousContent,
            after: content
          },
          user: {
            id: socket.userId,
            name: socket.user.name,
            email: socket.user.email,
            avatar: socket.user.avatar
          },
          metadata: {
            preview: typeof content === 'string' 
              ? content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
              : JSON.stringify(content).substring(0, 150) + '...',
            wordCount: typeof content === 'string' 
              ? content.replace(/<[^>]*>/g, '').split(/\s+/).length
              : 0,
            characterCount: typeof content === 'string' 
              ? content.length
              : JSON.stringify(content).length,
            sessionId: socket.sessionID || Date.now().toString(),
            userAgent: socket.handshake.headers['user-agent'],
            ipAddress: socket.handshake.address
          },
          version: await getNextVersion(projectId, sectionKey),
          tags: ['collaboration']
        });
        
        await historyEntry.save();
        
        // Emitir cambios a todos los usuarios del proyecto excepto al emisor
        socket.to(`project-${projectId}`).emit('project-section-updated', {
          sectionKey,
          content,
          changeType,
          updatedBy: {
            id: socket.userId,
            name: socket.user.name,
            email: socket.user.email
          },
          timestamp: new Date()
        });
        
        // Emitir nueva entrada del historial a todos los usuarios
        io.to(`project-${projectId}`).emit('history-entry-added', historyEntry.toJSON());
        
      } catch (error) {
        console.error('Error actualizando sección del proyecto:', error);
        socket.emit('error', { message: 'Error actualizando sección del proyecto' });
      }
    });
    
    // Función auxiliar para obtener la siguiente versión
    async function getNextVersion(projectId, sectionKey) {
      const lastEntry = await ChangeHistory.findOne({
        projectId,
        sectionKey
      }).sort({ version: -1 });
      
      return lastEntry ? lastEntry.version + 1 : 1;
    }
    
    // Evento para indicar que un usuario está editando una sección
    socket.on('section-editing', (data) => {
      const { projectId, sectionKey, isEditing } = data;
      socket.to(`project-${projectId}`).emit('user-editing-section', {
        sectionKey,
        isEditing,
        user: {
          id: socket.userId,
          name: socket.user.name,
          email: socket.user.email
        }
      });
    });

    // Eventos del tablero Kanban
    socket.on('board-update', async (data) => {
      try {
        const { projectId, boardData } = data;
        
        // Actualizar el tablero en la base de datos
        await Board.findOneAndUpdate(
          { project: projectId },
          { lists: boardData.lists },
          { new: true, upsert: true }
        );

        // Emitir cambios a todos los usuarios del proyecto excepto al emisor
        socket.to(`project-${projectId}`).emit('board-updated', {
          boardData,
          updatedBy: {
            id: socket.userId,
            name: socket.user.name
          }
        });
      } catch (error) {
        console.error('Error actualizando tablero:', error);
        socket.emit('error', { message: 'Error actualizando tablero' });
      }
    });

    // Eventos del editor colaborativo
    socket.on('document-edit', async (data) => {
      try {
        const { projectId, documentId, content, type } = data;
        
        // Actualizar documento en la base de datos
        const document = await Document.findOneAndUpdate(
          { _id: documentId, project: projectId },
          { 
            content,
            lastEditedBy: socket.userId,
            $inc: { version: 1 }
          },
          { new: true, upsert: true }
        );

        // Guardar en historial
        document.history.push({
          content,
          editedBy: socket.userId,
          version: document.version
        });
        await document.save();

        // Emitir cambios a todos los usuarios del proyecto excepto al emisor
        socket.to(`project-${projectId}`).emit('document-updated', {
          documentId,
          content,
          type,
          updatedBy: {
            id: socket.userId,
            name: socket.user.name
          },
          version: document.version
        });
      } catch (error) {
        console.error('Error actualizando documento:', error);
        socket.emit('error', { message: 'Error actualizando documento' });
      }
    });

    // Cursor en tiempo real para el editor
    socket.on('cursor-position', (data) => {
      const { projectId, documentId, position } = data;
      socket.to(`project-${projectId}`).emit('cursor-updated', {
        documentId,
        userId: socket.userId,
        userName: socket.user.name,
        position
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${socket.user.name}`);
      
      // Remover usuario de todos los proyectos activos
      if (socket.currentProject) {
        const projectId = socket.currentProject;
        if (activeUsers.has(projectId)) {
          const projectUsers = activeUsers.get(projectId);
          projectUsers.forEach(user => {
            if (user.socketId === socket.id) {
              projectUsers.delete(user);
            }
          });
          
          // Enviar lista actualizada
          const usersList = Array.from(projectUsers);
          io.to(`project-${projectId}`).emit('active-users-updated', {
            users: usersList,
            totalUsers: usersList.length
          });
        }
      }
    });
  });
};

// Agregar al final del archivo, antes de module.exports

// Mapa para trackear usuarios conectados por proyecto
const connectedUsersByProject = new Map();

// Función para agregar usuario a un proyecto
const addUserToProject = (projectId, userInfo) => {
  if (!connectedUsersByProject.has(projectId)) {
    connectedUsersByProject.set(projectId, new Map());
  }
  connectedUsersByProject.get(projectId).set(userInfo.id, {
    ...userInfo,
    connectedAt: new Date()
  });
};

// Función para remover usuario de un proyecto
const removeUserFromProject = (projectId, userId) => {
  if (connectedUsersByProject.has(projectId)) {
    connectedUsersByProject.get(projectId).delete(userId);
    if (connectedUsersByProject.get(projectId).size === 0) {
      connectedUsersByProject.delete(projectId);
    }
  }
};

// Función para obtener usuarios conectados de un proyecto
const getConnectedUsers = (projectId) => {
  if (!connectedUsersByProject.has(projectId)) {
    return [];
  }
  return Array.from(connectedUsersByProject.get(projectId).values());
};

// Agregar estos eventos al socket handler existente
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Usuario conectado: ${socket.user.name} (${socket.userId})`);

    // Unirse a un proyecto
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      socket.currentProject = projectId;
      
      // Agregar usuario a la lista de activos
      if (!activeUsers.has(projectId)) {
        activeUsers.set(projectId, new Set());
      }
      
      const projectUsers = activeUsers.get(projectId);
      projectUsers.add({
        id: socket.userId,
        name: socket.user.name,
        email: socket.user.email,
        avatar: socket.user.avatar || null,
        socketId: socket.id,
        joinedAt: new Date()
      });
      
      console.log(`👥 Usuario ${socket.user.name} se unió al proyecto ${projectId}`);
      
      // Enviar lista actualizada de usuarios conectados a todos
      const usersList = Array.from(projectUsers);
      io.to(`project-${projectId}`).emit('active-users-updated', {
        users: usersList,
        totalUsers: usersList.length
      });
      
      // Notificar a otros usuarios del proyecto
      socket.to(`project-${projectId}`).emit('user-joined', {
        userId: socket.userId,
        userName: socket.user.name,
        userEmail: socket.user.email,
        avatar: socket.user.avatar
      });
    });

    // Salir de un proyecto
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      
      // Remover usuario de la lista de activos
      if (activeUsers.has(projectId)) {
        const projectUsers = activeUsers.get(projectId);
        projectUsers.forEach(user => {
          if (user.socketId === socket.id) {
            projectUsers.delete(user);
          }
        });
        
        // Enviar lista actualizada
        const usersList = Array.from(projectUsers);
        io.to(`project-${projectId}`).emit('active-users-updated', {
          users: usersList,
          totalUsers: usersList.length
        });
      }
      
      console.log(`👋 Usuario ${socket.user.name} salió del proyecto ${projectId}`);
      
      // Notificar a otros usuarios del proyecto
      socket.to(`project-${projectId}`).emit('user-left', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Nuevo evento para actualización de secciones del proyecto
    socket.on('project-section-update', async (data) => {
      try {
        const { projectId, sectionKey, content, changeType } = data;
        
        // Crear entrada en el historial usando el modelo
        const ChangeHistory = require('../models/ChangeHistory');
        const historyEntry = await ChangeHistory.createEntry({
          projectId,
          sectionKey,
          changeType: changeType || 'edit',
          content: {
            before: null, // Se podría obtener del estado anterior
            after: content
          },
          user: {
            id: socket.userId,
            name: socket.user.name,
            email: socket.user.email
          },
          metadata: {
            userAgent: socket.handshake.headers['user-agent'],
            ipAddress: socket.handshake.address
          }
        });
        
        // Emitir cambios a todos los usuarios del proyecto excepto al emisor
        socket.to(`project-${projectId}`).emit('project-section-updated', {
          sectionKey,
          content,
          changeType,
          updatedBy: {
            id: socket.userId,
            name: socket.user.name,
            email: socket.user.email
          },
          timestamp: new Date()
        });
        
        // Emitir nueva entrada del historial a todos los usuarios del proyecto
        io.to(`project-${projectId}`).emit('history-entry-added', historyEntry);
        
      } catch (error) {
        console.error('Error actualizando sección del proyecto:', error);
        socket.emit('error', { message: 'Error actualizando sección del proyecto' });
      }
    });

    // Evento para indicar que un usuario está editando una sección
    socket.on('section-editing', (data) => {
      const { projectId, sectionKey, isEditing } = data;
      socket.to(`project-${projectId}`).emit('user-editing-section', {
        sectionKey,
        isEditing,
        user: {
          id: socket.userId,
          name: socket.user.name,
          email: socket.user.email
        }
      });
    });

    // Eventos del tablero Kanban
    socket.on('board-update', async (data) => {
      try {
        const { projectId, boardData } = data;
        
        // Actualizar el tablero en la base de datos
        await Board.findOneAndUpdate(
          { project: projectId },
          { lists: boardData.lists },
          { new: true, upsert: true }
        );

        // Emitir cambios a todos los usuarios del proyecto excepto al emisor
        socket.to(`project-${projectId}`).emit('board-updated', {
          boardData,
          updatedBy: {
            id: socket.userId,
            name: socket.user.name
          }
        });
      } catch (error) {
        console.error('Error actualizando tablero:', error);
        socket.emit('error', { message: 'Error actualizando tablero' });
      }
    });

    // Eventos del editor colaborativo
    socket.on('document-edit', async (data) => {
      try {
        const { projectId, documentId, content, type } = data;
        
        // Actualizar documento en la base de datos
        const document = await Document.findOneAndUpdate(
          { _id: documentId, project: projectId },
          { 
            content,
            lastEditedBy: socket.userId,
            $inc: { version: 1 }
          },
          { new: true, upsert: true }
        );

        // Guardar en historial
        document.history.push({
          content,
          editedBy: socket.userId,
          version: document.version
        });
        await document.save();

        // Emitir cambios a todos los usuarios del proyecto excepto al emisor
        socket.to(`project-${projectId}`).emit('document-updated', {
          documentId,
          content,
          type,
          updatedBy: {
            id: socket.userId,
            name: socket.user.name
          },
          version: document.version
        });
      } catch (error) {
        console.error('Error actualizando documento:', error);
        socket.emit('error', { message: 'Error actualizando documento' });
      }
    });

    // Cursor en tiempo real para el editor
    socket.on('cursor-position', (data) => {
      const { projectId, documentId, position } = data;
      socket.to(`project-${projectId}`).emit('cursor-updated', {
        documentId,
        userId: socket.userId,
        userName: socket.user.name,
        position
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${socket.user.name}`);
      
      // Remover usuario de todos los proyectos activos
      if (socket.currentProject) {
        const projectId = socket.currentProject;
        if (activeUsers.has(projectId)) {
          const projectUsers = activeUsers.get(projectId);
          projectUsers.forEach(user => {
            if (user.socketId === socket.id) {
              projectUsers.delete(user);
            }
          });
          
          // Enviar lista actualizada
          const usersList = Array.from(projectUsers);
          io.to(`project-${projectId}`).emit('active-users-updated', {
            users: usersList,
            totalUsers: usersList.length
          });
        }
      }
    });
  });
};

module.exports = socketHandler;