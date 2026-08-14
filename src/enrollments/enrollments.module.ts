import { Module } from '@nestjs/common';

import { StudentsModule } from '../students/students.module';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { EnrollmentsService } from './services/enrollments.service';
import { EnrollmentsRepository } from './repositories/enrollments.repository';

@Module({
  imports: [StudentsModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, EnrollmentsRepository],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
