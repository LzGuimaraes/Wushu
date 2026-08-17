import { Module } from '@nestjs/common';

import { StudentsModule } from '../students/students.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentsRepository } from './repositories/payments.repository';
import { MonthlyPaymentsScheduler } from './monthly-payments.scheduler';

@Module({
  imports: [StudentsModule, EnrollmentsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository, MonthlyPaymentsScheduler],
  exports: [PaymentsService],
})
export class PaymentsModule {}
