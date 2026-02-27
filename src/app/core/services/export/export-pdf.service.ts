import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { TmertEvaluation } from '../../models/evaluation.model';

@Injectable({
  providedIn: 'root',
})
export class ExportPdfService {
  generateEvaluationReport(evaluation: TmertEvaluation) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(20);
    doc.text('Reporte de Evaluación TMERT', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    // Info General
    const dateStr = evaluation.completedDate
      ? new Date(evaluation.completedDate).toLocaleDateString()
      : new Date().toLocaleDateString();

    doc.text(`Empresa: ${evaluation.companyName || 'Sin Registrar'}`, 14, 40);
    doc.text(`Fecha: ${dateStr}`, 14, 50);
    doc.text(`Identificador: ${evaluation.id}`, 14, 60);

    let startY = 80;

    // Resultado IA Etapa 4
    if (evaluation.stage4) {
      doc.setFontSize(14);
      doc.text('Evaluación de Riesgo', 14, startY);

      const riskLevel =
        evaluation.stage4.result === 'ACCEPTABLE'
          ? 'Aceptable'
          : evaluation.stage4.result === 'NOT_ACCEPTABLE'
            ? 'No Aceptable'
            : 'Crítico';

      doc.setFontSize(12);
      doc.text(`Nivel de Riesgo: ${riskLevel}`, 14, startY + 10);

      const justStr = doc.splitTextToSize(
        `Justificación: ${evaluation.stage4.justification}`,
        pageWidth - 28
      );
      doc.text(justStr, 14, startY + 20);

      startY += 30 + justStr.length * 5;
    }

    // Plan de acción Etapa 5
    if (evaluation.stage5 && evaluation.stage5.length > 0) {
      doc.setFontSize(14);
      doc.text('Plan de Acción Sugerido', 14, startY);

      const tableData = evaluation.stage5.map((measure: any) => [
        measure.measure,
        measure.type === 'TECHNICAL' ? 'Ingenieril' : 'Administrativa',
        measure.priority,
        measure.status || 'Pendiente',
      ]);

      (doc as any).autoTable({
        startY: startY + 5,
        head: [['Medida', 'Tipo', 'Prioridad', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    // Save
    doc.save(`Reporte_TMERT_${evaluation.id}.pdf`);
  }
}
