const mongoose = require('mongoose');

const changeHistorySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  sectionKey: {
    type: String,
    required: true,
    enum: ['mission', 'vision', 'objectives', 'strategy', 'conclusions', 'valueChainDiagnostic', 'general']
  },
  changeType: {
    type: String,
    required: true,
    enum: ['create', 'edit', 'delete', 'restore']
  },
  content: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  preview: {
    type: String,
    maxlength: 200
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    avatar: String
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String
  },
  version: {
    type: Number,
    default: 1
  },
  isReverted: {
    type: Boolean,
    default: false
  },
  revertedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revertedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
changeHistorySchema.index({ projectId: 1, createdAt: -1 });
changeHistorySchema.index({ projectId: 1, sectionKey: 1, createdAt: -1 });
changeHistorySchema.index({ 'user.id': 1, createdAt: -1 });

// Virtual para tiempo relativo
changeHistorySchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInMinutes = Math.floor((now - this.createdAt) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
  return this.createdAt.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
});

// Método estático para crear entrada de historial
changeHistorySchema.statics.createEntry = async function(data) {
  const { projectId, sectionKey, changeType, content, user, metadata } = data;
  
  // Generar preview del contenido
  let preview = '';
  if (content && content.after) {
    const text = typeof content.after === 'string' ? content.after : JSON.stringify(content.after);
    preview = text.replace(/<[^>]*>/g, '').substring(0, 150) + (text.length > 150 ? '...' : '');
  }
  
  // Obtener el número de versión
  const lastEntry = await this.findOne({ projectId, sectionKey }).sort({ version: -1 });
  const version = lastEntry ? lastEntry.version + 1 : 1;
  
  return this.create({
    projectId,
    sectionKey,
    changeType,
    content,
    preview,
    user,
    metadata,
    version
  });
};

// Método estático para obtener historial paginado
changeHistorySchema.statics.getHistory = async function(projectId, options = {}) {
  const {
    sectionKey,
    page = 1,
    limit = 20,
    userId,
    changeType,
    startDate,
    endDate
  } = options;
  
  const query = { projectId };
  
  if (sectionKey && sectionKey !== 'all') {
    query.sectionKey = sectionKey;
  }
  
  if (userId) {
    query['user.id'] = userId;
  }
  
  if (changeType) {
    query.changeType = changeType;
  }
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const [entries, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user.id', 'name email avatar')
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    entries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

module.exports = mongoose.model('ChangeHistory', changeHistorySchema);