import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

export interface StudentReportRow {
  userId: string;
  name: string;
  email: string;
  studentProfileId: string | null;
  enrollmentId: string | null;
  enrollmentNumber: string | null;
  paidInMonth: boolean;
}

export interface DashboardResponse {
  month: string;
  counts: {
    pendingRegistrations: number;
    activePaid: number;
    activeUnpaid: number;
    pendingPayments: number;
  };
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /** Intervalo [início, fim) do mês "YYYY-MM". */
  private monthRange(month: string): { start: Date; end: Date } {
    const [year, monthIndex] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, monthIndex - 1, 1));
    const end = new Date(Date.UTC(year, monthIndex, 1));
    return { start, end };
  }

  /**
   * Escopo por instrutor: quando o usuário não é ADMIN, restringe as
   * consultas financeiras/alunos às turmas em que ele é instrutor.
   * Validação no servidor — nunca confia em parâmetros do cliente.
   */
  private scopeCondition(user: AuthenticatedUser) {
    if (user.role === UserRole.ADMIN) return {};
    return {
      studentClasses: { some: { class: { instructorId: user.userId } } },
    };
  }

  /**
   * Apenas ADMIN ou instrutores (usuário que leciona alguma turma) podem
   * acessar o painel administrativo.
   */
  private async assertAuthorized(user: AuthenticatedUser): Promise<void> {
    if (user.role === UserRole.ADMIN) return;
    const isInstructor = await this.prisma.class.count({
      where: { instructorId: user.userId },
    });
    if (isInstructor === 0) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar o painel administrativo',
      );
    }
  }

  async getDashboard(
    user: AuthenticatedUser,
    month: string,
  ): Promise<DashboardResponse> {
    await this.assertAuthorized(user);
    const { start, end } = this.monthRange(month);
    const scope = this.scopeCondition(user);

    const pendingRegistrations = await this.prisma.user.count({
      where: { status: 'PENDING' },
    });

    const pendingPayments = await this.prisma.payment.count({
      where: {
        status: 'PENDING',
        competence: { gte: start, lt: end },
        enrollment: scope,
      },
    });

    const rows = await this.loadActiveStudents(scope, start, end);

    return {
      month,
      counts: {
        pendingRegistrations,
        activePaid: rows.filter((r) => r.paidInMonth).length,
        activeUnpaid: rows.filter((r) => !r.paidInMonth).length,
        pendingPayments,
      },
    };
  }

  /** Lista detalhada (alimenta os cards "em dia" e "não pagos" + CSV). */
  async getStudentsReport(
    user: AuthenticatedUser,
    month: string,
  ): Promise<StudentReportRow[]> {
    await this.assertAuthorized(user);
    const { start, end } = this.monthRange(month);
    const scope = this.scopeCondition(user);
    return this.loadActiveStudents(scope, start, end);
  }

  /**
   * Alunos ativos (status ACTIVE) que possuem matrícula dentro do escopo,
   * cada um marcado como pago no mês (PAID) ou não. Uma única consulta
   * garante que "em dia" + "não pagos" não se sobreponham.
   */
  private async loadActiveStudents(
    scope: object,
    start: Date,
    end: Date,
  ): Promise<StudentReportRow[]> {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        studentProfile: { enrollments: { some: scope } },
      },
      include: {
        studentProfile: {
          select: {
            id: true,
            enrollments: {
              where: scope,
              include: {
                payments: {
                  where: { competence: { gte: start, lt: end } },
                  select: { status: true },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return users.map((user) => {
      const enrollment = user.studentProfile?.enrollments[0] ?? null;
      const paidInMonth =
        enrollment?.payments.some((payment) => payment.status === 'PAID') ??
        false;
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        studentProfileId: user.studentProfile?.id ?? null,
        enrollmentId: enrollment?.id ?? null,
        enrollmentNumber: enrollment?.enrollmentNumber ?? null,
        paidInMonth,
      };
    });
  }
}
