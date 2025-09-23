const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Board = require('../models/Board');
const Document = require('../models/Document');
const ChangeHistory = require('../models/ChangeHistory');
const Project = require('../models/Project');

// Almacenar usuarios activos por proyecto
const activeUsers = new Map(); // projectId -> Map of userId -> user object

// Función para obtener la siguiente versión
const getNextVersion = async (projectId, sectionKey) => {
  try {
    const lastEntry = await ChangeHistory.findOne({
      projectId,
      sectionKey
    }).sort({ createdAt: -1 });
    
    return lastEntry ? lastEntry.version + 1 : 1;
  } catch (error) {
    console.error('Error obteniendo versión:', error);
    return 1;
  }
};

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
      
      // Inicializar Map si no existe
      if (!activeUsers.has(projectId)) {
        activeUsers.set(projectId, new Map());
      }
      
      const projectUsers = activeUsers.get(projectId);
      
      // Agregar o actualizar usuario
      projectUsers.set(socket.userId, {
        id: socket.userId,
        name: socket.user.name,
        email: socket.user.email,
        avatar: socket.user.avatar || null,
        socketId: socket.id,
        joinedAt: new Date()
      });
      
      console.log(`👥 Usuario ${socket.user.name} se unió al proyecto ${projectId}`);
      
      // Enviar lista actualizada de usuarios conectados a todos
      const usersList = Array.from(projectUsers.values());
      io.to(`project-${projectId}`).emit('active-users-updated', {
        users: usersList,
        totalUsers: usersList.length
      });
    });

    // Salir de un proyecto
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      
      if (activeUsers.has(projectId)) {
        const projectUsers = activeUsers.get(projectId);
        projectUsers.delete(socket.userId);
        
        // Enviar lista actualizada
        const usersList = Array.from(projectUsers.values());
        io.to(`project-${projectId}`).emit('active-users-updated', {
          users: usersList,
          totalUsers: usersList.length
        });
      }
    });

    // Actualización de sección de proyecto
    socket.on('project-section-update', async (data) => {
      try {
        const { projectId, sectionKey, content, changeType } = data;
        
        // Obtener contenido anterior para el historial
        const project = await Project.findById(projectId);
        const previousContent = project?.sections?.[sectionKey] || '';
        
        // Actualizar proyecto en la base de datos
        await Project.findByIdAndUpdate(
          projectId,
          { 
            [`sections.${sectionKey}`]: content,
            lastModified: new Date()
          },
          { new: true }
        );
        
        // Guardar en historial
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
        
      } catch (error) {
        console.error('Error actualizando sección:', error);
        socket.emit('error', { message: 'Error actualizando sección' });
      }
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${socket.user.name}`);
      
      // Remover usuario de todos los proyectos activos
      if (socket.currentProject) {
        const projectId = socket.currentProject;
        if (activeUsers.has(projectId)) {
          const projectUsers = activeUsers.get(projectId);
          projectUsers.delete(socket.userId);
          
          // Enviar lista actualizada
          const usersList = Array.from(projectUsers.values());
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