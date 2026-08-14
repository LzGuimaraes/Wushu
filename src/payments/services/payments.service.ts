import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';
import { UserRole } from '../../common/enums/user-role.enum';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
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

  async create(dto: CreatePaymentDto): Promise<PaymentEntity> {
    return this.paymentsRepository.create(dto);
  }

  async findAll(): Promise<PaymentEntity[]> {
    return this.paymentsRepository.findAll();
  }

  async findByEnrollmentId(enrollmentId: string): Promise<PaymentEntity[]> {
    return this.paymentsRepository.findByEnrollmentId(enrollmentId);
  }

  async findByEnrollmentIds(
    enrollmentIds: string[],
  ): Promise<PaymentEntity[]> {
    return this.paymentsRepository.findByEnrollmentIds(enrollmentIds);
  }

  async findOne(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.update(id, dto);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return payment;
  }

  /**
   * Confirmação de pagamento com validação de escopo no servidor:
   * ADMIN confirma qualquer pagamento; instrutor só confirma pagamentos
   * de matrículas vinculadas às próprias turmas.
   */
  async confirmAs(
    user: AuthenticatedUser,
    id: string,
  ): Promise<PaymentEntity> {
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
