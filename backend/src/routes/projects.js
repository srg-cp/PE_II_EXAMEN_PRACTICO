const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectSections,
  updateProjectSections
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/projects
// @desc    Crear proyecto
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del proyecto es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres'),
  body('objectives')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Los objetivos no pueden exceder 1000 caracteres'),
  body('memberIds')
    .optional()
    .isArray()
    .withMessage('memberIds debe ser un array'),
  body('memberIds.*')
    .optional()
    .isMongoId()
    .withMessage('IDs de miembros inválidos')
], createProject);

// @route   GET /api/projects
// @desc    Obtener proyectos del usuario
// @access  Private
router.get('/', auth, getProjects);

// @route   GET /api/projects/:id
// @desc    Obtener proyecto por ID
// @access  Private
router.get('/:id', auth, getProject);

// @route   GET /api/projects/:id/sections
// @desc    Obtener secciones del proyecto
// @access  Private
router.get('/:id/sections', auth, getProjectSections);

// @route   PUT /api/projects/:id/sections
// @desc    Actualizar secciones del proyecto
// @access  Private
router.put('/:id/sections', auth, updateProjectSections);

// @route   PUT /api/projects/:id
// @desc    Actualizar proyecto
// @access  Private
router.put('/:id', auth, updateProject);

// @route   DELETE /api/projects/:id
// @desc    Eliminar proyecto
// @access  Private
router.delete('/:id', auth, deleteProject);

// @route   POST /api/projects/:id/members
// @desc    Agregar miembro al proyecto
// @access  Private
router.post('/:id/members', auth, addMember);

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remover miembro del proyecto
// @access  Private
router.delete('/:id/members/:userId', auth, removeMember);

// Agregar estas rutas después de las existentes

// @route   GET /api/projects/:id/history
// @desc    Obtener historial de cambios del proyecto
// @access  Private
router.get('/:id/history', auth, async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const {
      sectionKey,
      page = 1,
      limit = 20,
      userId,
      changeType,
      startDate,
      endDate
    } = req.query;

    // Verificar acceso al proyecto
    const Project = require('../models/Project');
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const ChangeHistory = require('../models/ChangeHistory');
    const result = await ChangeHistory.getHistory(projectId, {
      sectionKey,
      page: parseInt(page),
      limit: parseInt(limit),
      userId,
      changeType,
      startDate,
      endDate
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching project history:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// @route   POST /api/projects/:id/history/:historyId/revert
// @desc    Revertir un cambio específico
// @access  Private
router.post('/:id/history/:historyId/revert', auth, async (req, res) => {
  try {
    const { id: projectId, historyId } = req.params;
    
    const ChangeHistory = require('../models/ChangeHistory');
    const Project = require('../models/Project');
    
    // Verificar acceso
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Encontrar la entrada del historial
    const historyEntry = await ChangeHistory.findById(historyId);
    if (!historyEntry) {
      return res.status(404).json({ message: 'Entrada de historial no encontrada' });
    }

    // Revertir el cambio
    const sectionKey = historyEntry.sectionKey;
    const previousContent = historyEntry.content.before;
    
    // Actualizar el proyecto
    if (sectionKey !== 'general') {
      project.sections[sectionKey] = previousContent;
      await project.save();
    }

    // Crear nueva entrada de historial para la reversión
    await ChangeHistory.createEntry({
      projectId,
      sectionKey,
      changeType: 'restore',
      content: {
        before: historyEntry.content.after,
        after: previousContent
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

    // Marcar la entrada original como revertida
    historyEntry.isReverted = true;
    historyEntry.revertedBy = req.user._id;
    historyEntry.revertedAt = new Date();
    await historyEntry.save();

    res.json({ 
      message: 'Cambio revertido exitosamente',
      content: previousContent
    });
  } catch (error) {
    console.error('Error reverting change:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;