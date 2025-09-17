const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Board = require('../models/Board');
const Document = require('../models/Document');

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
      console.log(`👥 Usuario ${socket.user.name} se unió al proyecto ${projectId}`);
      
      // Notificar a otros usuarios del proyecto
      socket.to(`project-${projectId}`).emit('user-joined', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Salir de un proyecto
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      console.log(`👋 Usuario ${socket.user.name} salió del proyecto ${projectId}`);
      
      // Notificar a otros usuarios del proyecto
      socket.to(`project-${projectId}`).emit('user-left', {
        userId: socket.userId,
        userName: socket.user.name
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
    });
  });
};

module.exports = socketHandler;