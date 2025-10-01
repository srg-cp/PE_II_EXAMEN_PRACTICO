const express = require('express');
const { body, query } = require('express-validator');
const {
  getProjectHistory,
  createHistoryEntry,
  restoreVersion,
  compareVersions
} = require('../controllers/changeHistoryController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects/:projectId/history
// @desc    Obtener historial de cambios del proyecto
// @access  Private
router.get('/projects/:projectId/history', [
  auth,
  query('sectionKey').optional().isIn(['all', 'mission', 'vision', 'objectives', 'swot', 'strategy', 'conclusions']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('changeType').optional().isIn(['create', 'edit', 'delete', 'restore']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], getProjectHistory);

// @route   POST /api/projects/:projectId/history
// @desc    Crear entrada en el historial
// @access  Private
router.post('/projects/:projectId/history', [
  auth,
  body('sectionKey').isIn(['mission', 'vision', 'objectives', 'swot', 'strategy', 'conclusions']),
  body('changeType').isIn(['create', 'edit', 'delete']),
  body('content').notEmpty(),
  body('metadata').optional().isObject(),
  body('isMinor').optional().isBoolean(),
  body('tags').optional().isArray()
], createHistoryEntry);

// @route   POST /api/projects/:projectId/history/:versionId/restore
// @desc    Restaurar una versión específica
// @access  Private
router.post('/projects/:projectId/history/:versionId/restore', auth, restoreVersion);

// @route   GET /api/projects/:projectId/history/compare
// @desc    Comparar dos versiones
// @access  Private
router.get('/projects/:projectId/history/compare', [
  auth,
  query('version1').isInt({ min: 1 }),
  query('version2').isInt({ min: 1 }),
  query('sectionKey').isIn(['mission', 'vision', 'objectives', 'strategy', 'conclusions'])
], compareVersions);

module.exports = router;