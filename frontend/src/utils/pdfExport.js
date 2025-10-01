import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportProjectToPDF = async (projectData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Colores para el diseño
  const primaryColor = [41, 128, 185]; // Azul profesional
  const secondaryColor = [52, 73, 94]; // Gris oscuro
  const accentColor = [231, 76, 60]; // Rojo para acentos
  const lightGray = [236, 240, 241]; // Gris claro para fondos

  // Función para agregar texto con salto de página automático
  const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0], align = 'left') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color[0], color[1], color[2]);
    
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    
    lines.forEach(line => {
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      
      if (align === 'center') {
        pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
      } else if (align === 'right') {
        pdf.text(line, pageWidth - margin, yPosition, { align: 'right' });
      } else {
        pdf.text(line, margin, yPosition);
      }
      
      yPosition += fontSize * 0.6;
    });
    
    yPosition += 3; // Espacio adicional
  };

  // Función para agregar línea decorativa
  const addDecorativeLine = (color = primaryColor, thickness = 0.5) => {
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setLineWidth(thickness);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  };

  // Función para agregar sección con diseño mejorado
  const addSection = (title, content) => {
    // Verificar espacio para nueva sección
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    // Fondo de la sección
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15, 'F');
    
    // Título de sección sin icono
    addText(title, 16, true, primaryColor);
    
    // Línea decorativa bajo el título
    addDecorativeLine(primaryColor, 1);
    
    // Contenido
    if (content) {
      // Remover HTML tags para el PDF
      const cleanContent = content.replace(/<[^>]*>/g, '').trim();
      if (cleanContent) {
        addText(cleanContent, 11, false, [0, 0, 0]);
      }
    }
    
    yPosition += 15;
  };

  // Función para agregar imagen del proyecto
  const addProjectImage = async (imageData) => {
    if (imageData && imageData.startsWith('data:image')) {
      try {
        const imgWidth = 60;
        const imgHeight = 60;
        const imgX = pageWidth - margin - imgWidth;
        const imgY = 30;
        
        pdf.addImage(imageData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
        return true;
      } catch (error) {
        console.warn('Error agregando imagen:', error);
        return false;
      }
    }
    return false;
  };

  try {
    // === PORTADA MEJORADA ===
    
    // Fondo decorativo superior
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Título principal
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('PLAN ESTRATÉGICO DE TI', pageWidth / 2, 25, { align: 'center' });
    
    yPosition = 60;
    
    // Agregar imagen del proyecto si existe
    const hasImage = await addProjectImage(projectData.image);
    
    // Información del proyecto
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const titleWidth = hasImage ? pageWidth - 140 : pageWidth - 40;
    const titleLines = pdf.splitTextToSize(projectData.name || 'Proyecto Sin Título', titleWidth);
    titleLines.forEach(line => {
      pdf.text(line, margin, yPosition);
      yPosition += 12;
    });
    
    yPosition += 10;
    
    // Descripción del proyecto
    if (projectData.description) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const descLines = pdf.splitTextToSize(projectData.description, pageWidth - 2 * margin);
      descLines.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += 8;
      });
    }
    
    yPosition += 20;
    
    // Información de generación
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, margin + 10, yPosition + 10);
    
    pdf.text(`Hora: ${new Date().toLocaleTimeString('es-ES')}`, margin + 10, yPosition + 20);
    
    // Pie de portada
    yPosition = pageHeight - 40;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('MindPlan - Sistema de Planeamiento Estratégico de TI', pageWidth / 2, yPosition, { align: 'center' });
    
    // === NUEVA PÁGINA PARA ÍNDICE ===
    pdf.addPage();
    yPosition = margin;
    
    // Título del índice
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('ÍNDICE', pageWidth / 2, 17, { align: 'center' });
    
    yPosition = 40;
    
    // Elementos del índice con mejor formato
    const indexItems = [
      '1. Resumen Ejecutivo',
      '2. Datos Generales del Proyecto',
      '3. Misión Organizacional',
      '4. Visión Estratégica',
      '5. Objetivos Estratégicos',
      '6. Análisis FODA',
      '7. Identificación De Estrategia',
      '8. Conclusiones'
    ];
    
    indexItems.forEach((item, index) => {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(item, margin + 10, yPosition);
      
      // Línea punteada
      const dots = '.';
      const dotWidth = pdf.getTextWidth(dots);
      let dotX = margin + 10 + pdf.getTextWidth(item) + 5;
      const pageNumX = pageWidth - margin - 20;
      
      while (dotX < pageNumX - 10) {
        pdf.text(dots, dotX, yPosition);
        dotX += dotWidth + 2;
      }
      
      // Número de página (simulado)
      pdf.text((index + 3).toString(), pageNumX, yPosition);
      yPosition += 12;
    });
    
    // === NUEVA PÁGINA PARA CONTENIDO ===
    pdf.addPage();
    yPosition = margin;

    // 1. Resumen Ejecutivo mejorado con objetivos estratégicos y análisis FODA
    let executiveSummary = `Este documento presenta el Plan Estratégico de Tecnologías de la Información para ${projectData.name || 'la organización'}. ` +
      'El plan establece la dirección estratégica, objetivos y iniciativas clave para alinear la tecnología con los objetivos del negocio. ' +
      'A través de un análisis exhaustivo de la situación actual y las necesidades futuras, se proponen estrategias innovadoras que ' +
      'permitirán optimizar los recursos tecnológicos y mejorar la competitividad organizacional.\n\n';

    // Agregar objetivos estratégicos al resumen ejecutivo - ESTRUCTURA CORREGIDA
    if (projectData.sections?.objectives?.strategic && Array.isArray(projectData.sections.objectives.strategic) && projectData.sections.objectives.strategic.length > 0) {
      executiveSummary += 'OBJETIVOS ESTRATÉGICOS:\n';
      projectData.sections.objectives.strategic.forEach((strategic, index) => {
        if (strategic.title && strategic.title.trim()) {
          executiveSummary += `${index + 1}. ${strategic.title}\n`;
          if (strategic.description && strategic.description.trim()) {
            executiveSummary += `   ${strategic.description}\n`;
          }
        }
      });
      executiveSummary += '\n';
    }

    // Agregar análisis FODA - ESTRUCTURA CORREGIDA
    let fodaData = null;
    
    // Intentar obtener los datos del análisis FODA de diferentes estructuras posibles
    if (projectData.sections?.valueChainDiagnostic?.content) {
      const content = typeof projectData.sections.valueChainDiagnostic.content === 'string' 
        ? JSON.parse(projectData.sections.valueChainDiagnostic.content) 
        : projectData.sections.valueChainDiagnostic.content;
      fodaData = content;
    } else if (projectData.sections?.valueChainDiagnostic) {
      fodaData = projectData.sections.valueChainDiagnostic;
    }

    if (fodaData && ((fodaData.strengths && fodaData.strengths.length > 0) || (fodaData.weaknesses && fodaData.weaknesses.length > 0))) {
      executiveSummary += 'ANÁLISIS FODA - POTENCIAL DE MEJORA DE LA CADENA DE VALOR INTERNA:\n\n';
      
      if (fodaData.strengths && fodaData.strengths.length > 0) {
        executiveSummary += 'FORTALEZAS:\n';
        fodaData.strengths.forEach((strength) => {
          if (strength && strength.trim()) {
            executiveSummary += `• ${strength}\n`;
          }
        });
        executiveSummary += '\n';
      }
      
      if (fodaData.weaknesses && fodaData.weaknesses.length > 0) {
        executiveSummary += 'DEBILIDADES:\n';
        fodaData.weaknesses.forEach((weakness) => {
          if (weakness && weakness.trim()) {
            executiveSummary += `• ${weakness}\n`;
          }
        });
        executiveSummary += '\n';
      }
    }

    addSection('1. RESUMEN EJECUTIVO', executiveSummary);

    // 2. Datos Generales
    let generalData = `Nombre del Proyecto: ${projectData.name || 'No especificado'}\n`;
    if (projectData.description) {
      generalData += `Descripción: ${projectData.description}\n`;
    }
    if (projectData.timeline?.startDate) {
      generalData += `Fecha de Inicio: ${new Date(projectData.timeline.startDate).toLocaleDateString('es-ES')}\n`;
    }
    if (projectData.timeline?.endDate) {
      generalData += `Fecha de Finalización: ${new Date(projectData.timeline.endDate).toLocaleDateString('es-ES')}\n`;
    }
    generalData += `Estado: ${projectData.status || 'Borrador'}`;
    
    addSection('2. DATOS GENERALES DEL PROYECTO', generalData);

    // Procesar las secciones del proyecto - CORREGIDO
    if (projectData.sections) {
      if (projectData.sections.mission) {
        addSection('3. MISIÓN ORGANIZACIONAL', projectData.sections.mission);
      }
      
      if (projectData.sections.vision) {
        addSection('4. VISIÓN ESTRATÉGICA', projectData.sections.vision);
      }
      
      // Objetivos estratégicos - ESTRUCTURA CORREGIDA
      if (projectData.sections.objectives?.strategic && Array.isArray(projectData.sections.objectives.strategic) && projectData.sections.objectives.strategic.length > 0) {
        let objectivesContent = '';
        projectData.sections.objectives.strategic.forEach((strategic, index) => {
          if (strategic.title && strategic.title.trim()) {
            objectivesContent += `${index + 1}. ${strategic.title}\n`;
            if (strategic.description && strategic.description.trim()) {
              objectivesContent += `   Descripción: ${strategic.description}\n`;
            }
            
            // Agregar objetivos específicos si existen
            if (strategic.specificObjectives && Array.isArray(strategic.specificObjectives) && strategic.specificObjectives.length > 0) {
              objectivesContent += '   Objetivos Específicos:\n';
              strategic.specificObjectives.forEach((specific, specIndex) => {
                if (specific.title && specific.title.trim()) {
                  objectivesContent += `   ${specIndex + 1}. ${specific.title}\n`;
                  if (specific.description && specific.description.trim()) {
                    objectivesContent += `      ${specific.description}\n`;
                  }
                  objectivesContent += `      Prioridad: ${specific.priority || 'Media'}\n`;
                  objectivesContent += `      Estado: ${specific.status || 'Pendiente'}\n`;
                }
              });
            }
            objectivesContent += '\n';
          }
        });
        addSection('5. OBJETIVOS ESTRATÉGICOS', objectivesContent);
      }

      // SECCIÓN: Análisis FODA completo - ESTRUCTURA CORREGIDA
      if (fodaData && ((fodaData.strengths && fodaData.strengths.length > 0) || (fodaData.weaknesses && fodaData.weaknesses.length > 0))) {
        let fodaContent = 'ANÁLISIS FODA - POTENCIAL DE MEJORA DE LA CADENA DE VALOR INTERNA\n\n';
        
        if (fodaData.strengths && fodaData.strengths.length > 0) {
          fodaContent += 'FORTALEZAS:\n';
          fodaData.strengths.forEach((strength, index) => {
            if (strength && strength.trim()) {
              fodaContent += `${index + 1}. ${strength}\n`;
            }
          });
          fodaContent += '\n';
        }
        
        if (fodaData.weaknesses && fodaData.weaknesses.length > 0) {
          fodaContent += 'DEBILIDADES:\n';
          fodaData.weaknesses.forEach((weakness, index) => {
            if (weakness && weakness.trim()) {
              fodaContent += `${index + 1}. ${weakness}\n`;
            }
          });
          fodaContent += '\n';
        }
        
        addSection('6. ANÁLISIS FODA', fodaContent);
      }
      
      if (projectData.sections.strategy) {
        addSection('7. IDENTIFICACIÓN DE ESTRATEGIA', projectData.sections.strategy);
      }
      
      if (projectData.sections.conclusions) {
        addSection('8. CONCLUSIONES', projectData.sections.conclusions);
      }
    }

    // Procesar documentos adicionales si existen
    if (projectData.documents && projectData.documents.length > 0) {
      projectData.documents.forEach((doc, index) => {
        if (doc.content && doc.content.trim()) {
          addSection(`${index + 9}. ${doc.title.toUpperCase()}`, doc.content);
        }
      });
    }

    // === PIE DE PÁGINA MEJORADO - ERROR CORREGIDO ===
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Línea decorativa en el pie - COORDENADAS CORREGIDAS
      pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setLineWidth(0.5);
      pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Información del pie
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      
      // Nombre del proyecto (izquierda)
      pdf.text(projectData.name || 'Plan Estratégico de TI', margin, pageHeight - 10);
      
      // Número de página (centro)
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Fecha (derecha)
      pdf.text(new Date().toLocaleDateString('es-ES'), pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // Descargar el PDF con nombre mejorado
    const fileName = `Plan-Estrategico-TI-${projectData.name?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'proyecto'}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generando PDF:', error);
    return { success: false, error: error.message };
  }
};

// Función para exportar con captura de pantalla (alternativa)
export const exportProjectWithScreenshot = async (elementId, projectData) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento no encontrado');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Páginas adicionales si es necesario
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `captura-${projectData.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'proyecto'}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generando PDF con captura:', error);
    return { success: false, error: error.message };
  }
};