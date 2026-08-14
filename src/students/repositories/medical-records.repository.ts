import { Injectable } from '@nestjs/common';
import { MedicalRecord } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { MedicalRecordEntity } from '../entities/medical-record.entity';
import { UpsertMedicalRecordDto } from '../dto/upsert-medical-record.dto';

@Injectable()
export class MedicalRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByStudentProfileId(
    studentProfileId: string,
  ): Promise<MedicalRecordEntity | null> {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { studentProfileId },
    });
    return record ? this.toEntity(record) : null;
  }

  async upsert(
    studentProfileId: string,
    data: UpsertMedicalRecordDto,
  ): Promise<MedicalRecordEntity> {
    const record = await this.prisma.medicalRecord.upsert({
      where: { studentProfileId },
      create: { studentProfileId, ...data },
      update: { ...data },
    });
    return this.toEntity(record);
  }

  private toEntity(record: MedicalRecord): MedicalRecordEntity {
    return Object.assign(new MedicalRecordEntity(), record);
  }
}
