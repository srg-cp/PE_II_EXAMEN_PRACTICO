const { validationResult } = require('express-validator');
const Document = require('../models/Document');
const Project = require('../models/Project');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

// Crear documento
const createDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, projectId, type, tags } = req.body;

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

    const document = new Document({
      title,
      content,
      project: projectId,
      type: type || 'general',
      tags: tags || [],
      createdBy: req.user._id,
      lastEditedBy: req.user._id
    });

    await document.save();
    await document.populate('createdBy lastEditedBy', 'name email');

    res.status(201).json({
      message: 'Documento creado exitosamente',
      document
    });
  } catch (error) {
    console.error('Error creando documento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener documentos de un proyecto
const getDocuments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type, search } = req.query;

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

    let query = { project: projectId };
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(query)
      .populate('createdBy lastEditedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener documento por ID
const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy lastEditedBy', 'name email')
      .populate('project');

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar acceso
    const project = document.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar documento
const updateDocument = async (req, res) => {
  try {
    const { title, content, type, tags } = req.body;

    const document = await Document.findById(req.params.id).populate('project');
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar acceso
    const project = document.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Guardar versión anterior en historial
    document.versions.push({
      content: document.content,
      editedBy: document.lastEditedBy,
      editedAt: document.updatedAt
    });

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        content, 
        type, 
        tags,
        lastEditedBy: req.user._id,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('createdBy lastEditedBy', 'name email');

    res.json({
      message: 'Documento actualizado exitosamente',
      document: updatedDocument
    });
  } catch (error) {
    console.error('Error actualizando documento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar documento
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('project');
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar acceso (solo owner del proyecto o creador del documento)
    const project = document.project;
    const canDelete = project.owner.toString() === req.user._id.toString() ||
                     document.createdBy.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este documento' });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Exportar documento a PDF
const exportToPDF = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy lastEditedBy', 'name email')
      .populate('project', 'name');

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar acceso
    const project = document.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Template HTML para el PDF
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{{title}}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .project-name { color: #666; font-size: 14px; }
            .document-title { font-size: 24px; font-weight: bold; margin: 10px 0; }
            .meta-info { color: #888; font-size: 12px; margin-bottom: 20px; }
            .content { line-height: 1.6; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="project-name">Proyecto: {{projectName}}</div>
            <h1 class="document-title">{{title}}</h1>
            <div class="meta-info">
                Creado por: {{createdBy}} | Última edición: {{lastEditedBy}} | {{updatedAt}}
            </div>
        </div>
        <div class="content">
            {{{content}}}
        </div>
        <div class="footer">
            Generado por MindPlan - Sistema de Planeamiento Estratégico de TI
        </div>
    </body>
    </html>
    `;

    const template = handlebars.compile(htmlTemplate);
    const html = template({
      title: document.title,
      projectName: document.project.name,
      content: document.content,
      createdBy: document.createdBy.name,
      lastEditedBy: document.lastEditedBy.name,
      updatedAt: document.updatedAt.toLocaleDateString('es-ES')
    });

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.title}.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('Error exportando a PDF:', error);
    res.status(500).json({ message: 'Error generando PDF' });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  exportToPDF
};