const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  searchUsers
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registrar usuario
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login usuario
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Obtener perfil del usuario
// @access  Private
router.get('/profile', auth, getProfile);

// @route   PUT /api/auth/profile
// @desc    Actualizar perfil del usuario
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   GET /api/auth/search-users
// @desc    Buscar usuarios por nombre o email
// @access  Private
router.get('/search-users', auth, searchUsers);

module.exports = router;