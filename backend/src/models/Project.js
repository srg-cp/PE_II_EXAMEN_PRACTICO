const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  objectives: {
    type: String,
    trim: true
  },
  // Nuevos campos para las secciones del proyecto
  sections: {
    mission: {
      type: String,
      default: ''
    },
    vision: {
      type: String,
      default: ''
    },
    objectives: {
      strategic: [{
        id: Number,
        title: String,
        description: String,
        specificObjectives: [{
          id: Number,
          title: String,
          description: String,
          priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
          },
          status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed'],
            default: 'pending'
          }
        }]
      }]
    },
    swot: {
      strengths: {
        type: [{
          id: Number,
          text: String
        }],
        default: []
      },
      weaknesses: {
        type: [{
          id: Number,
          text: String
        }],
        default: []
      },
      opportunities: {
        type: [{
          id: Number,
          text: String
        }],
        default: []
      },
      threats: {
        type: [{
          id: Number,
          text: String
        }],
        default: []
      }
    },
    valueChainDiagnostic: {
      diagnostic: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      strengths: {
        type: [String],
        default: []
      },
      weaknesses: {
        type: [String],
        default: []
      }
    },
    strategy: {
      type: String,
      default: ''
    },
    conclusions: {
      type: String,
      default: ''
    }
  },
  timeline: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowComments: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);