import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { AdminService, StudentReportRow } from './admin.service';

const PAGE_MARGIN = 40;
const PAGE_HEIGHT = 842; // A4 em pontos

interface Column {
  header: string;
  width: number;
}

const COLUMNS: Column[] = [
  { header: 'Nome', width: 180 },
  { header: 'E-mail', width: 160 },
  { header: 'Matrícula', width: 100 },
  { header: 'Situação', width: 90 },
];

@Injectable()
export class AdminPdfService {
  constructor(private readonly adminService: AdminService) {}

  async generateStudentsReport(
    user: AuthenticatedUser,
    month: string,
  ): Promise<Buffer> {
    const rows = await this.adminService.getStudentsReport(user, month);
    return buildStudentsReportPdf(month, rows);
  }
}

function buildStudentsReportPdf(
  month: string,
  rows: StudentReportRow[],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Cabeçalho do documento
    doc
      .fontSize(16)
      .text(`Relatório de Alunos — ${month}`, { align: 'center' });
    doc.moveDown(0.4);
    doc
      .fontSize(9)
      .fillColor('#666666')
      .text(
        `Gerado em ${new Date().toLocaleString('pt-BR')} • ${rows.length} aluno(s)`,
        { align: 'center' },
      );
    doc.fillColor('#000000');
    doc.moveDown(1);

    let y = doc.y;

    const drawHeader = () => {
      doc.font('Helvetica-Bold');
      const headerY = y;
      let x = PAGE_MARGIN;
      for (const column of COLUMNS) {
        doc.text(column.header, x, headerY, {
          width: column.width,
          lineBreak: false,
        });
        x += column.width;
      }
      doc.font('Helvetica');
      y += 18;
    };

    const ensureSpace = (height: number) => {
      if (y + height > PAGE_HEIGHT - PAGE_MARGIN) {
        doc.addPage();
        y = PAGE_MARGIN;
        drawHeader();
      }
    };

    drawHeader();

    for (const row of rows) {
      ensureSpace(16);

      const cells = [
        row.name,
        row.email,
        row.enrollmentNumber ?? '—',
        row.paidInMonth ? 'Pago' : 'Pendente',
      ];

      const rowY = y;
      let x = PAGE_MARGIN;
      for (let i = 0; i < COLUMNS.length; i += 1) {
        doc.text(cells[i], x, rowY, {
          width: COLUMNS[i].width - 4,
          lineBreak: false,
          ellipsis: true,
        });
        x += COLUMNS[i].width;
      }
      y += 16;
    }

    doc.end();
  });
}
