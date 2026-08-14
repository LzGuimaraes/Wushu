import { Injectable, NotFoundException } from '@nestjs/common';

import { PaymentsRepository } from '../repositories/payments.repository';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

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

  async confirm(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.confirm(id);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return payment;
  }

  async remove(id: string): Promise<void> {
    await this.paymentsRepository.remove(id);
  }
}
