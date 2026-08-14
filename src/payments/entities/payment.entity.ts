import { Prisma } from '@prisma/client';

import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export class PaymentEntity {
  id: string;
  enrollmentId: string;
  amount: Prisma.Decimal;
  competence: Date;
  dueDate: Date;
  paymentDate: Date | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PaymentEntity> = {}) {
    Object.assign(this, partial);
  }
}
