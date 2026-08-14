import { Module } from '@nestjs/common';

import { ClassesController } from './controllers/classes.controller';
import { ClassesService } from './services/classes.service';
import { ClassesRepository } from './repositories/classes.repository';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, ClassesRepository],
  exports: [ClassesService],
})
export class ClassesModule {}
