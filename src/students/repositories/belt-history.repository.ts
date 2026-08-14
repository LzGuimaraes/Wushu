import { Injectable } from '@nestjs/common';
import { BeltHistory } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { isRecordNotFoundError } from '../../common/utils/prisma-error.util';
import { BeltHistoryEntity } from '../entities/belt-history.entity';
import { CreateBeltHistoryDto } from '../dto/create-belt-history.dto';

@Injectable()
export class BeltHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBeltHistoryDto): Promise<BeltHistoryEntity> {
    const entry = await this.prisma.beltHistory.create({ data });
    return this.toEntity(entry);
  }

  async findAllByStudentProfileId(
    studentProfileId: string,
  ): Promise<BeltHistoryEntity[]> {
    const entries = await this.prisma.beltHistory.findMany({
      where: { studentProfileId },
      orderBy: { graduationDate: 'desc' },
    });
    return entries.map((entry) => this.toEntity(entry));
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.beltHistory.delete({ where: { id } });
    } catch (error) {
      if (!isRecordNotFoundError(error)) {
        throw error;
      }
    }
  }

  private toEntity(entry: BeltHistory): BeltHistoryEntity {
    return Object.assign(new BeltHistoryEntity(), entry);
  }
}
