import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { AdminService } from './admin.service';
import { AdminPdfService } from './admin-pdf.service';

const MONTH_REGEX = /^\d{4}-\d{2}$/;

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STUDENT)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminPdfService: AdminPdfService,
  ) {}

  private parseMonth(month?: string): string {
    const value = month ?? new Date().toISOString().slice(0, 7);
    if (!MONTH_REGEX.test(value)) {
      throw new BadRequestException('Mês inválido. Use o formato YYYY-MM');
    }
    return value;
  }

  /** Contagens dos 4 cards do dashboard (com escopo por instrutor). */
  @Get('dashboard')
  async dashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string,
  ) {
    return this.adminService.getDashboard(user, this.parseMonth(month));
  }

  /** Lista detalhada de alunos ativos (em dia / não pagos) para telas. */
  @Get('students-report')
  async studentsReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string,
  ) {
    return this.adminService.getStudentsReport(user, this.parseMonth(month));
  }

  /** Exportação em PDF da lista de alunos ativos (substitui o CSV). */
  @Get('students-report/pdf')
  async studentsReportPdf(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
    @Query('month') month?: string,
  ) {
    const parsed = this.parseMonth(month);
    const buffer = await this.adminPdfService.generateStudentsReport(
      user,
      parsed,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="relatorio-alunos-${parsed}.pdf"`,
    });

    return new StreamableFile(buffer);
  }
}
