import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportProjectToPDF = async (projectData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Función para agregar texto con salto de página automático
  const addText = (text, fontSize = 12, isBold = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    
    lines.forEach(line => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    
    yPosition += 5; // Espacio adicional
  };

  // Función para agregar sección
  const addSection = (title, content) => {
    // Título de sección
    addText(title, 16, true);
    yPosition += 5;
    
    // Contenido
    if (content) {
      // Remover HTML tags para el PDF
      const cleanContent = content.replace(/<[^>]*>/g, '').trim();
      if (cleanContent) {
        addText(cleanContent, 11);
      }
    }
    
    yPosition += 10;
  };

  try {
    // Portada
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Plan Estratégico de TI', pageWidth / 2, 50, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(projectData.title || 'Proyecto Sin Título', pageWidth / 2, 70, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 90, { align: 'center' });
    
    // Nueva página para el contenido
    pdf.addPage();
    yPosition = margin;

    // Índice
    addText('ÍNDICE', 18, true);
    addText('1. Resumen Ejecutivo', 12);
    addText('2. Datos Generales', 12);
    addText('3. Misión', 12);
    addText('4. Visión', 12);
    addText('5. Objetivos', 12);
    addText('6. Análisis FODA', 12);
    addText('7. Estrategias', 12);
    addText('8. Conclusiones', 12);
    
    yPosition += 20;

    // Resumen Ejecutivo
    addSection('1. RESUMEN EJECUTIVO', 
      `Este documento presenta el Plan Estratégico de Tecnologías de la Información para ${projectData.title || 'la organización'}. ` +
      'El plan establece la dirección estratégica, objetivos y iniciativas clave para alinear la tecnología con los objetivos del negocio.'
    );

    // Procesar las listas del tablero
    if (projectData.board && projectData.board.lists) {
      projectData.board.lists.forEach((list, index) => {
        const sectionNumber = index + 2;
        let sectionTitle = `${sectionNumber}. ${list.title.toUpperCase()}`;
        
        // Contenido de las tarjetas de la lista
        let sectionContent = '';
        if (list.cards && list.cards.length > 0) {
          list.cards.forEach((card, cardIndex) => {
            sectionContent += `${cardIndex + 1}. ${card.title}\n`;
            if (card.content) {
              sectionContent += `${card.content}\n\n`;
            }
          });
        }
        
        addSection(sectionTitle, sectionContent);
      });
    }

    // Procesar documentos adicionales
    if (projectData.documents && projectData.documents.length > 0) {
      projectData.documents.forEach(doc => {
        if (doc.content && doc.content.trim()) {
          addSection(doc.title.toUpperCase(), doc.content);
        }
      });
    }

    // Pie de página en todas las páginas
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Descargar el PDF
    const fileName = `plan-estrategico-${projectData.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'proyecto'}-${new Date().toISOString().split('T')[0]}.pdf`;
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