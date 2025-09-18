const ChangeHistory = require('../models/ChangeHistory');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

// Obtener historial de cambios de un proyecto
const getProjectHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      sectionKey, 
      page = 1, 
      limit = 50, 
      userId, 
      changeType,
      startDate,
      endDate
    } = req.query;

    // Verificar acceso al proyecto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Construir filtros
    const filters = { projectId };
    if (sectionKey && sectionKey !== 'all') filters.sectionKey = sectionKey;
    if (userId) filters['user.id'] = userId;
    if (changeType) filters.changeType = changeType;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    // Obtener historial con paginación
    const skip = (page - 1) * limit;
    const history = await ChangeHistory.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user.id', 'name email avatar')
      .lean();

    // Obtener total para paginación
    const total = await ChangeHistory.countDocuments(filters);

    // Obtener estadísticas
    const stats = await ChangeHistory.getHistoryStats(projectId);

    res.json({
      history,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
        hasNext: skip + history.length < total,
        hasPrev: page > 1
      },
      stats: stats[0] || null
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear entrada en el historial
const createHistoryEntry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { 
      sectionKey, 
      changeType, 
      content, 
      metadata = {},
      isMinor = false,
      tags = []
    } = req.body;

    // Verificar acceso al proyecto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Obtener la última versión para esta sección
    const lastEntry = await ChangeHistory.findOne({
      projectId,
      sectionKey
    }).sort({ version: -1 });

    const nextVersion = lastEntry ? lastEntry.version + 1 : 1;

    // Crear entrada del historial
    const historyEntry = new ChangeHistory({
      projectId,
      sectionKey,
      changeType,
      content,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      },
      metadata: {
        ...metadata,
        sessionId: req.sessionID || Date.now().toString(),
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      },
      version: nextVersion,
      isMinor,
      tags
    });

    await historyEntry.save();

    // Limpiar historial antiguo si es necesario
    if (nextVersion % 100 === 0) { // Cada 100 versiones
      await ChangeHistory.cleanOldHistory(projectId);
    }

    res.status(201).json(historyEntry);
  } catch (error) {
    console.error('Error creando entrada del historial:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Restaurar una versión específica
const restoreVersion = async (req, res) => {
  try {
    const { projectId, versionId } = req.params;

    // Verificar acceso al proyecto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Encontrar la versión a restaurar
    const versionToRestore = await ChangeHistory.findById(versionId);
    if (!versionToRestore) {
      return res.status(404).json({ message: 'Versión no encontrada' });
    }

    // Actualizar el proyecto con el contenido restaurado
    const sectionKey = versionToRestore.sectionKey;
    const restoredContent = versionToRestore.content.after;

    project.sections[sectionKey] = restoredContent;
    await project.save();

    // Crear entrada del historial para la restauración
    const restoreEntry = new ChangeHistory({
      projectId,
      sectionKey,
      changeType: 'restore',
      content: {
        before: project.sections[sectionKey],
        after: restoredContent
      },
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      },
      metadata: {
        preview: `Restaurado desde versión ${versionToRestore.version}`,
        sessionId: req.sessionID || Date.now().toString(),
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        restoredFromVersion: versionToRestore.version
      },
      version: (await ChangeHistory.findOne({ projectId, sectionKey }).sort({ version: -1 }))?.version + 1 || 1,
      tags: ['restore']
    });

    await restoreEntry.save();

    res.json({
      message: 'Versión restaurada exitosamente',
      content: restoredContent,
      historyEntry: restoreEntry
    });
  } catch (error) {
    console.error('Error restaurando versión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Comparar dos versiones
const compareVersions = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { version1, version2, sectionKey } = req.query;

    // Verificar acceso al proyecto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(member => member.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Obtener las dos versiones
    const [v1, v2] = await Promise.all([
      ChangeHistory.findOne({ projectId, sectionKey, version: version1 }),
      ChangeHistory.findOne({ projectId, sectionKey, version: version2 })
    ]);

    if (!v1 || !v2) {
      return res.status(404).json({ message: 'Una o ambas versiones no encontradas' });
    }

    res.json({
      version1: v1,
      version2: v2,
      comparison: {
        timeDiff: Math.abs(v2.createdAt - v1.createdAt),
        usersSame: v1.user.id.toString() === v2.user.id.toString(),
        changeTypes: [v1.changeType, v2.changeType]
      }
    });
  } catch (error) {
    console.error('Error comparando versiones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getProjectHistory,
  createHistoryEntry,
  restoreVersion,
  compareVersions
};