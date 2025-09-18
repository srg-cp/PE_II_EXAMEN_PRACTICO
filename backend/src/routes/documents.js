const express = require('express');
const {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  exportToPDF
} = require('../controllers/documentController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/documents
// @desc    Crear documento
// @access  Private
router.post('/', auth, createDocument);

// @route   GET /api/documents/project/:projectId
// @desc    Obtener documentos de un proyecto
// @access  Private
router.get('/project/:projectId', auth, getDocuments);

// @route   GET /api/documents/:id
// @desc    Obtener documento por ID
// @access  Private
router.get('/:id', auth, getDocument);

// @route   PUT /api/documents/:id
// @desc    Actualizar documento
// @access  Private
router.put('/:id', auth, updateDocument);

// @route   DELETE /api/documents/:id
// @desc    Eliminar documento
// @access  Private
router.delete('/:id', auth, deleteDocument);

// @route   POST /api/documents/:id/export
// @desc    Exportar documento a PDF
// @access  Private
router.post('/:id/export', auth, exportToPDF);

module.exports = router;