import { Injectable, NotFoundException } from '@nestjs/common';

import { MedicalRecordsRepository } from '../repositories/medical-records.repository';
import { UpsertMedicalRecordDto } from '../dto/upsert-medical-record.dto';
import { MedicalRecordEntity } from '../entities/medical-record.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly medicalRecordsRepository: MedicalRecordsRepository,
  ) {}

  async findByStudentProfileId(
    studentProfileId: string,
  ): Promise<MedicalRecordEntity> {
    const record =
      await this.medicalRecordsRepository.findByStudentProfileId(studentProfileId);
    if (!record) {
      throw new NotFoundException('Ficha médica não encontrada');
    }
    return record;
  }

  async upsert(
    studentProfileId: string,
    dto: UpsertMedicalRecordDto,
  ): Promise<MedicalRecordEntity> {
    return this.medicalRecordsRepository.upsert(studentProfileId, dto);
  }
}
