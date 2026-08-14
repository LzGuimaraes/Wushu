import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { AdminService } from './admin.service';

const MONTH_REGEX = /^\d{4}-\d{2}$/;

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STUDENT)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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

  /** Lista detalhada de alunos ativos (em dia / não pagos) para CSV e telas. */
  @Get('students-report')
  async studentsReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string,
  ) {
    return this.adminService.getStudentsReport(user, this.parseMonth(month));
  }
}
