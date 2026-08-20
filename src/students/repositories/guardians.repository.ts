import { Injectable } from '@nestjs/common';
import { Guardian } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { isRecordNotFoundError } from '../../common/utils/prisma-error.util';
import { GuardianEntity } from '../entities/guardian.entity';
import { CreateGuardianDto } from '../dto/create-guardian.dto';
import { UpdateGuardianDto } from '../dto/update-guardian.dto';

@Injectable()
export class GuardiansRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateGuardianDto): Promise<GuardianEntity> {
    const guardian = await this.prisma.guardian.create({ data });
    return this.toEntity(guardian);
  }

  async findById(id: string): Promise<GuardianEntity | null> {
    const guardian = await this.prisma.guardian.findUnique({ where: { id } });
    return guardian ? this.toEntity(guardian) : null;
  }

  async findAllByStudentProfileId(
    studentProfileId: string,
  ): Promise<GuardianEntity[]> {
    const guardians = await this.prisma.guardian.findMany({
      where: { studentProfileId },
    });
    return guardians.map((guardian) => this.toEntity(guardian));
  }

  async update(
    id: string,
    data: UpdateGuardianDto,
  ): Promise<GuardianEntity | null> {
    try {
      const guardian = await this.prisma.guardian.update({ where: { id }, data });
      return this.toEntity(guardian);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.guardian.delete({ where: { id } });
    } catch (error) {
      if (!isRecordNotFoundError(error)) {
        throw error;
      }
    }
  }

  private toEntity(guardian: Guardian): GuardianEntity {
    return Object.assign(new GuardianEntity(), guardian);
  }
}
