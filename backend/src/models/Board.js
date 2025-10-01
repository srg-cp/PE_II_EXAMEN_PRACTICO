const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  position: {
    type: Number,
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  labels: [{
    name: String,
    color: String
  }],
  dueDate: Date,
  attachments: [{
    name: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: Number,
    required: true
  },
  cards: [cardSchema]
}, {
  timestamps: true
});

const boardSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  lists: [listSchema]
}, {
  timestamps: true
});

// Crear listas predeterminadas al crear un tablero
boardSchema.pre('save', function(next) {
  if (this.isNew && this.lists.length === 0) {
    this.lists = [
      { title: 'Datos Generales', position: 0, cards: [] },
      { title: 'Misión', position: 1, cards: [] },
      { title: 'Visión', position: 2, cards: [] },
      { title: 'Objetivos', position: 3, cards: [] },
      { title: 'Estrategias', position: 4, cards: [] },
      { title: 'Conclusiones', position: 5, cards: [] }
    ];
  }
  next();
});

module.exports = mongoose.model('Board', boardSchema);
