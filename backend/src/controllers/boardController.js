const { validationResult } = require('express-validator');
const Board = require('../models/Board');
const Project = require('../models/Project');

// Crear tablero
const createBoard = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, projectId, type } = req.body;

    // Verificar que el proyecto existe y el usuario tiene acceso
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado al proyecto' });
    }

    const board = new Board({
      name,
      description,
      project: projectId,
      type,
      createdBy: req.user._id,
      columns: [
        { name: 'Por Hacer', cards: [] },
        { name: 'En Progreso', cards: [] },
        { name: 'Completado', cards: [] }
      ]
    });

    await board.save();
    await board.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Tablero creado exitosamente',
      board
    });
  } catch (error) {
    console.error('Error creando tablero:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener tableros de un proyecto
const getBoards = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verificar acceso al proyecto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const boards = await Board.find({ project: projectId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ boards });
  } catch (error) {
    console.error('Error obteniendo tableros:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener tablero por ID
const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('project');

    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Verificar acceso
    const project = board.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.json({ board });
  } catch (error) {
    console.error('Error obteniendo tablero:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar tablero
const updateBoard = async (req, res) => {
  try {
    const { name, description, columns } = req.body;

    const board = await Board.findById(req.params.id).populate('project');
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Verificar acceso
    const project = board.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.id,
      { name, description, columns },
      { new: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: 'Tablero actualizado exitosamente',
      board: updatedBoard
    });
  } catch (error) {
    console.error('Error actualizando tablero:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar tablero
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('project');
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Solo el owner del proyecto puede eliminar
    const project = board.project;
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el propietario del proyecto puede eliminar tableros' });
    }

    await Board.findByIdAndDelete(req.params.id);

    res.json({ message: 'Tablero eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando tablero:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Agregar tarjeta
const addCard = async (req, res) => {
  try {
    const { title, description, columnIndex, assignedTo, priority, dueDate } = req.body;

    const board = await Board.findById(req.params.id).populate('project');
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Verificar acceso
    const project = board.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const newCard = {
      title,
      description,
      assignedTo,
      priority: priority || 'medium',
      dueDate,
      createdBy: req.user._id,
      createdAt: new Date()
    };

    board.columns[columnIndex].cards.push(newCard);
    await board.save();

    res.json({
      message: 'Tarjeta agregada exitosamente',
      board
    });
  } catch (error) {
    console.error('Error agregando tarjeta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar tarjeta
const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title, description, assignedTo, priority, dueDate, columnIndex, cardIndex } = req.body;

    const board = await Board.findById(req.params.boardId).populate('project');
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Verificar acceso
    const project = board.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const card = board.columns[columnIndex].cards.id(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Tarjeta no encontrada' });
    }

    card.title = title || card.title;
    card.description = description || card.description;
    card.assignedTo = assignedTo || card.assignedTo;
    card.priority = priority || card.priority;
    card.dueDate = dueDate || card.dueDate;
    card.updatedAt = new Date();

    await board.save();

    res.json({
      message: 'Tarjeta actualizada exitosamente',
      board
    });
  } catch (error) {
    console.error('Error actualizando tarjeta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar tarjeta
const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { columnIndex } = req.body;

    const board = await Board.findById(req.params.boardId).populate('project');
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Verificar acceso
    const project = board.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    board.columns[columnIndex].cards.id(cardId).remove();
    await board.save();

    res.json({
      message: 'Tarjeta eliminada exitosamente',
      board
    });
  } catch (error) {
    console.error('Error eliminando tarjeta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Mover tarjeta
const moveCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { sourceColumnIndex, targetColumnIndex, targetCardIndex } = req.body;

    const board = await Board.findById(req.params.boardId).populate('project');
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Verificar acceso
    const project = board.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Encontrar y remover la tarjeta de la columna origen
    const card = board.columns[sourceColumnIndex].cards.id(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Tarjeta no encontrada' });
    }

    board.columns[sourceColumnIndex].cards.id(cardId).remove();
    
    // Agregar la tarjeta a la columna destino
    board.columns[targetColumnIndex].cards.splice(targetCardIndex, 0, card);
    
    await board.save();

    res.json({
      message: 'Tarjeta movida exitosamente',
      board
    });
  } catch (error) {
    console.error('Error moviendo tarjeta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  addCard,
  updateCard,
  deleteCard,
  moveCard
};