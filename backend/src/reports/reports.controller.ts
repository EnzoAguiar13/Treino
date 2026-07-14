import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PermissionsGuard, RequirePermissions } from '../auth/permissions.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(PermissionsGuard)
@RequirePermissions('reports.export')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('csv')
  async csv(@Res() res: Response) {
    const data = await this.service.csv();
    res
      .setHeader('Content-Type', 'text/csv; charset=utf-8')
      .setHeader('Content-Disposition', 'attachment; filename="afiliados.csv"')
      .send('﻿' + data);
  }

  @Get('excel')
  async excel(@Res() res: Response) {
    const buffer = await this.service.excel();
    res
      .setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      .setHeader('Content-Disposition', 'attachment; filename="afiliados.xlsx"')
      .send(buffer);
  }

  @Get('pdf')
  async pdf(@Res() res: Response) {
    const buffer = await this.service.pdf();
    res
      .setHeader('Content-Type', 'application/pdf')
      .setHeader('Content-Disposition', 'attachment; filename="afiliados.pdf"')
      .send(buffer);
  }
}
