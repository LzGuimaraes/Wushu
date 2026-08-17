import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';
import { UserRole } from '../../common/enums/user-role.enum';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { assertAdminOrInstructor } from '../../common/utils/authorization.util';
import {
  currentMonth,
  generatePendingMonthlyPayments,
} from '../../common/utils/monthly-payments.util';
import { PaymentsRepository } from '../repositories/payments.repository';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * ADMIN gerencia qualquer mensalidade; instrutor apenas mensalidades de
   * matrículas vinculadas às suas próprias turmas.
   */
  private async assertCanManage(
    user: AuthenticatedUser,
    enrollmentId?: string,
  ): Promise<void> {
    await assertAdminOrInstructor(this.prisma.class, user);

    if (user.role !== UserRole.ADMIN && enrollmentId) {
      const linked = await this.prisma.studentClass.count({
        where: {
          enrollmentId,
          class: { instructorId: user.userId },
        },
      });
      if (linked === 0) {
        throw new ForbiddenException(
          'Você só pode gerenciar mensalidades de matrículas das suas turmas',
        );
      }
    }
  }

  async create(
    user: AuthenticatedUser,
    dto: CreatePaymentDto,
  ): Promise<PaymentEntity> {
    await this.assertCanManage(user, dto.enrollmentId);
    return this.paymentsRepository.create(dto);
  }

  async findAll(): Promise<PaymentEntity[]> {
    return this.paymentsRepository.findAll();
  }

  async findByEnrollmentId(enrollmentId: string): Promise<PaymentEntity[]> {
    return this.paymentsRepository.findByEnrollmentId(enrollmentId);
  }

  async findByEnrollmentIds(enrollmentIds: string[]): Promise<PaymentEntity[]> {
    return this.paymentsRepository.findByEnrollmentIds(enrollmentIds);
  }

  async findOne(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return payment;
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    dto: UpdatePaymentDto,
  ): Promise<PaymentEntity> {
    const payment = await this.findOne(id);
    await this.assertCanManage(user, payment.enrollmentId);

    const updated = await this.paymentsRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return updated;
  }

  /**
   * Gera mensalidades pendentes para o mês informado (padrão: mês corrente)
   * para todas as matrículas ATIVAS. Idempotente.
   */
  async generateMonthlyPayments(
    month?: string,
  ): Promise<{ month: string; created: number }> {
    const target = month ?? currentMonth();
    const created = await generatePendingMonthlyPayments(this.prisma, target);
    return { month: target, created };
  }

  /** Endpoint manual: gera mensalidades do mês (ADMIN ou instrutor). */
  async generateMonthlyPaymentsFor(
    user: AuthenticatedUser,
    month?: string,
  ): Promise<{ month: string; created: number }> {
    await assertAdminOrInstructor(this.prisma.class, user);
    return this.generateMonthlyPayments(month);
  }

  /**
   * Confirmação de pagamento com validação de escopo no servidor:
   * ADMIN confirma qualquer pagamento; instrutor só confirma pagamentos
   * de matrículas vinculadas às próprias turmas.
   */
  async confirmAs(user: AuthenticatedUser, id: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (user.role !== UserRole.ADMIN) {
      const isOwnClass = await this.prisma.studentClass.count({
        where: {
          enrollmentId: payment.enrollmentId,
          class: { instructorId: user.userId },
        },
      });
      if (isOwnClass === 0) {
        throw new ForbiddenException(
          'Você não pode aprovar pagamentos fora das suas turmas',
        );
      }
    }

    const confirmed = await this.paymentsRepository.confirm(id);
    if (!confirmed) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return confirmed;
  }

  async remove(id: string): Promise<void> {
    await this.paymentsRepository.remove(id);
  }
}
