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
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
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

module.exports = router;