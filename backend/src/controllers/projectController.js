const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');

// Crear proyecto
const createProject = async (req, res) => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Errores de validación:', errors.array());
      return res.status(400).json({ 
        message: 'Datos de entrada inválidos',
        errors: errors.array() 
      });
    }

    const { name, description, objectives, timeline, image, memberIds } = req.body;
    
    console.log('Datos recibidos para crear proyecto:', {
      name,
      description,
      objectives,
      timeline,
      image,
      memberIds,
      userId: req.user._id
    });

    // Validar que el usuario esté autenticado
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Validar que los miembros existan
    let validMembers = [req.user._id];
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      try {
        const existingUsers = await User.find({ 
          _id: { $in: memberIds },
          isActive: true 
        });
        validMembers = [...validMembers, ...existingUsers.map(user => user._id)];
        console.log('Miembros válidos encontrados:', validMembers.length);
      } catch (userError) {
        console.error('Error buscando usuarios:', userError);
        return res.status(400).json({ message: 'Error validando miembros del proyecto' });
      }
    }

    // Crear el proyecto
    const projectData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      objectives: objectives ? objectives.trim() : '',
      timeline: timeline && typeof timeline === 'object' ? timeline : {},
      image: image || '',
      owner: req.user._id,
      members: [...new Set(validMembers)] // Eliminar duplicados
    };

    console.log('Creando proyecto con datos:', projectData);

    const project = new Project(projectData);
    await project.save();
    
    // Poblar los datos del proyecto
    await project.populate('owner members', 'name email avatar');

    console.log('Proyecto creado exitosamente:', project._id);

    res.status(201).json({
      message: 'Proyecto creado exitosamente',
      project
    });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    console.error('Error stack:', error.stack);
    
    // Manejar errores específicos de MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Error de validación de datos',
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Ya existe un proyecto con ese nombre'
      });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// Obtener proyectos del usuario
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner members', 'name email avatar')
    .sort({ createdAt: -1 });

    // Devolver directamente el array en lugar de un objeto
    res.json(projects);
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener secciones del proyecto
const getProjectSections = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Verificar que el usuario tenga acceso
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Si no existen secciones, crear estructura por defecto
    const defaultSections = {
      mission: '',
      vision: '',
      objectives: {
        strategic: []
      },
      swot: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      },
      strategy: '',
      conclusions: ''
    };

    const sections = project.sections || defaultSections;
    res.json(sections);
  } catch (error) {
    console.error('Error obteniendo secciones del proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar secciones del proyecto
const updateProjectSections = async (req, res) => {
  try {
    const { sections } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Verificar que el usuario tenga acceso
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Registrar cambios en el historial
    const ChangeHistory = require('../models/ChangeHistory');
    const oldSections = project.sections || {};
    
    // Comparar y registrar cambios por sección
    for (const [sectionKey, newContent] of Object.entries(sections)) {
      const oldContent = oldSections[sectionKey];
      
      // Solo registrar si hay cambios
      if (JSON.stringify(oldContent) !== JSON.stringify(newContent)) {
        await ChangeHistory.createEntry({
          projectId: req.params.id,
          sectionKey,
          changeType: oldContent ? 'edit' : 'create',
          content: {
            before: oldContent,
            after: newContent
          },
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
          },
          metadata: {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip
          }
        });
      }
    }

    // Actualizar las secciones
    project.sections = sections;
    await project.save();

    res.json({ 
      message: 'Secciones actualizadas exitosamente',
      sections: project.sections 
    });
  } catch (error) {
    console.error('Error actualizando secciones del proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener proyecto por ID (actualizado para devolver estructura correcta)
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Verificar que el usuario tenga acceso
    const hasAccess = project.owner._id.toString() === req.user._id.toString() ||
                     project.members.some(member => member._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Devolver el proyecto directamente (no envuelto en objeto)
    res.json(project);
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar proyecto
const updateProject = async (req, res) => {
  try {
    const { name, description, objectives, timeline, status, image, memberIds, settings } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Solo el owner puede actualizar
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el propietario puede actualizar el proyecto' });
    }

    // Validar y actualizar miembros si se proporcionan
    let updatedMembers = project.members;
    if (memberIds !== undefined) {
      // Siempre incluir al owner
      let validMembers = [req.user._id];
      
      if (memberIds && memberIds.length > 0) {
        const existingUsers = await User.find({ 
          _id: { $in: memberIds },
          isActive: true 
        });
        validMembers = [...validMembers, ...existingUsers.map(user => user._id)];
      }
      
      updatedMembers = [...new Set(validMembers)];
    }

    const updateData = {
      name: name || project.name,
      description: description !== undefined ? description : project.description,
      objectives: objectives !== undefined ? objectives : project.objectives,
      timeline: timeline || project.timeline,
      status: status || project.status,
      image: image !== undefined ? image : project.image,
      members: updatedMembers,
      settings: settings ? { ...project.settings, ...settings } : project.settings
    };

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner members', 'name email avatar');

    res.json({
      message: 'Proyecto actualizado exitosamente',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar proyecto
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Solo el owner puede eliminar
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el propietario puede eliminar el proyecto' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Agregar miembro
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Solo el owner puede agregar miembros
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el propietario puede agregar miembros' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'El usuario ya es miembro del proyecto' });
    }

    project.members.push(user._id);
    await project.save();
    await project.populate('owner members', 'name email');

    res.json({
      message: 'Miembro agregado exitosamente',
      project
    });
  } catch (error) {
    console.error('Error agregando miembro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Remover miembro
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Solo el owner puede remover miembros
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el propietario puede remover miembros' });
    }

    project.members = project.members.filter(
      member => member.toString() !== req.params.userId
    );

    await project.save();
    await project.populate('owner members', 'name email');

    res.json({
      message: 'Miembro removido exitosamente',
      project
    });
  } catch (error) {
    console.error('Error removiendo miembro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectSections,
  updateProjectSections
};
