const express = require('express');
const {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  addCard,
  updateCard,
  deleteCard,
  moveCard
} = require('../controllers/boardController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/boards
// @desc    Crear tablero
// @access  Private
router.post('/', auth, createBoard);

// @route   GET /api/boards/project/:projectId
// @desc    Obtener tableros de un proyecto
// @access  Private
router.get('/project/:projectId', auth, getBoards);

// @route   GET /api/boards/:id
// @desc    Obtener tablero por ID
// @access  Private
router.get('/:id', auth, getBoard);

// @route   PUT /api/boards/:id
// @desc    Actualizar tablero
// @access  Private
router.put('/:id', auth, updateBoard);

// @route   DELETE /api/boards/:id
// @desc    Eliminar tablero
// @access  Private
router.delete('/:id', auth, deleteBoard);

// @route   POST /api/boards/:id/cards
// @desc    Agregar tarjeta al tablero
// @access  Private
router.post('/:id/cards', auth, addCard);

// @route   PUT /api/boards/:boardId/cards/:cardId
// @desc    Actualizar tarjeta
// @access  Private
router.put('/:boardId/cards/:cardId', auth, updateCard);

// @route   DELETE /api/boards/:boardId/cards/:cardId
// @desc    Eliminar tarjeta
// @access  Private
router.delete('/:boardId/cards/:cardId', auth, deleteCard);

// @route   PUT /api/boards/:boardId/cards/:cardId/move
// @desc    Mover tarjeta
// @access  Private
router.put('/:boardId/cards/:cardId/move', auth, moveCard);

module.exports = router;