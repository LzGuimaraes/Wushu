import { Injectable } from '@nestjs/common';
import { Payment, Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { isRecordNotFoundError } from '../../common/utils/prisma-error.util';
import { PaymentEntity } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePaymentDto): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.create({
      data: data as unknown as Prisma.PaymentUncheckedCreateInput,
    });
    return this.toEntity(payment);
  }

  async findAll(): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany();
    return payments.map((payment) => this.toEntity(payment));
  }

  async findByEnrollmentId(enrollmentId: string): Promise<PaymentEntity[]> {
    const payments = await this.prisma.payment.findMany({
      where: { enrollmentId },
    });
    return payments.map((payment) => this.toEntity(payment));
  }

  async findByEnrollmentIds(
    enrollmentIds: string[],
  ): Promise<PaymentEntity[]> {
    if (enrollmentIds.length === 0) {
      return [];
    }
    const payments = await this.prisma.payment.findMany({
      where: { enrollmentId: { in: enrollmentIds } },
    });
    return payments.map((payment) => this.toEntity(payment));
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    return payment ? this.toEntity(payment) : null;
  }

  async update(
    id: string,
    data: UpdatePaymentDto,
  ): Promise<PaymentEntity | null> {
    try {
      const payment = await this.prisma.payment.update({
        where: { id },
        data: data as unknown as Prisma.PaymentUncheckedUpdateInput,
      });
      return this.toEntity(payment);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async confirm(id: string): Promise<PaymentEntity | null> {
    try {
      const payment = await this.prisma.payment.update({
        where: { id },
        data: { status: 'PAID', paymentDate: new Date() },
      });
      return this.toEntity(payment);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.payment.delete({ where: { id } });
    } catch (error) {
      if (!isRecordNotFoundError(error)) {
        throw error;
      }
    }
  }

  private toEntity(payment: Payment): PaymentEntity {
    return Object.assign(new PaymentEntity(), payment);
  }
}
