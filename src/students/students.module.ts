import { Module } from '@nestjs/common';

import { StudentProfilesController } from './controllers/student-profiles.controller';
import { MedicalRecordsController } from './controllers/medical-records.controller';
import { GuardiansController } from './controllers/guardians.controller';
import { BeltHistoryController } from './controllers/belt-history.controller';
import { StudentProfilesService } from './services/student-profiles.service';
import { MedicalRecordsService } from './services/medical-records.service';
import { GuardiansService } from './services/guardians.service';
import { BeltHistoryService } from './services/belt-history.service';
import { StudentProfilesRepository } from './repositories/student-profiles.repository';
import { MedicalRecordsRepository } from './repositories/medical-records.repository';
import { GuardiansRepository } from './repositories/guardians.repository';
import { BeltHistoryRepository } from './repositories/belt-history.repository';

@Module({
  controllers: [
    StudentProfilesController,
    MedicalRecordsController,
    GuardiansController,
    BeltHistoryController,
  ],
  providers: [
    StudentProfilesService,
    MedicalRecordsService,
    GuardiansService,
    BeltHistoryService,
    StudentProfilesRepository,
    MedicalRecordsRepository,
    GuardiansRepository,
    BeltHistoryRepository,
  ],
  exports: [StudentProfilesService],
})
export class StudentsModule {}
