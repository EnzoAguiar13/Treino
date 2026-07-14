import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument = require('pdfkit');
import { PrismaService } from '../prisma/prisma.service';

const COLUMNS: { key: string; header: string }[] = [
  { key: 'externalId', header: 'ID' },
  { key: 'name', header: 'Nome' },
  { key: 'status', header: 'Status' },
  { key: 'categories', header: 'Categorias' },
  { key: 'registrations', header: 'Registros' },
  { key: 'ftd', header: 'FTD' },
  { key: 'deposits', header: 'Depósitos' },
  { key: 'volume', header: 'Volume' },
  { key: 'netPl', header: 'Net P&L' },
  { key: 'ggr', header: 'GGR' },
  { key: 'commission', header: 'Comissão' },
  { key: 'trafficInvestment', header: 'Investimento' },
  { key: 'roi', header: 'ROI' },
  { key: 'cac', header: 'CAC' },
  { key: 'ggrMargin', header: 'Margem GGR' },
  { key: 'profit', header: 'Lucro' },
];

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private async rows() {
    const affiliates = await this.prisma.affiliate.findMany({
      include: { categories: true },
      orderBy: { name: 'asc' },
    });
    return affiliates.map((a) => ({
      ...a,
      categories: a.categories.map((c) => c.category).join(', '),
      deposits: Number(a.deposits),
      volume: Number(a.volume),
      netPl: Number(a.netPl),
      ggr: Number(a.ggr),
      ggrMargin: Number(a.ggrMargin),
      commission: Number(a.commission),
      trafficInvestment: Number(a.trafficInvestment),
      roi: Number(a.roi),
      cac: Number(a.cac),
      profit: Number(a.profit),
    }));
  }

  async csv(): Promise<string> {
    const rows = await this.rows();
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = COLUMNS.map((c) => esc(c.header)).join(';');
    const body = rows
      .map((r) => COLUMNS.map((c) => esc((r as any)[c.key])).join(';'))
      .join('\n');
    return `${header}\n${body}`;
  }

  async excel(): Promise<Buffer> {
    const rows = await this.rows();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Afiliados');
    ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: 18 }));
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8540A' } };
    rows.forEach((r) => ws.addRow(r));
    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  pdf(): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const rows = await this.rows();
        const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape' });
        const chunks: Buffer[] = [];
        doc.on('data', (c: Buffer) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.fillColor('#E8540A').fontSize(18).text('EsportivaBet — Relatório de Afiliados');
        doc.moveDown(0.5);
        doc.fillColor('#333333').fontSize(9).text(new Date().toLocaleString('pt-BR'));
        doc.moveDown();

        const keys = COLUMNS.slice(0, 10);
        const colWidth = (doc.page.width - 72) / keys.length;
        let y = doc.y;
        doc.fontSize(8).fillColor('#000000');
        keys.forEach((c, i) => doc.text(c.header, 36 + i * colWidth, y, { width: colWidth - 4 }));
        y += 16;
        for (const r of rows) {
          if (y > doc.page.height - 50) {
            doc.addPage();
            y = 36;
          }
          keys.forEach((c, i) =>
            doc.text(String((r as any)[c.key] ?? ''), 36 + i * colWidth, y, {
              width: colWidth - 4,
            }),
          );
          y += 14;
        }
        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }
}
