const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['mission', 'vision', 'objectives', 'swot', 'strategies', 'conclusions', 'general'],
    default: 'general'
  },
  sectionType: {
    type: String,
    enum: ['mission', 'vision', 'objectives', 'strategies', 'conclusions', 'general'],
    default: 'general'
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  history: [{
    content: String,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    version: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);