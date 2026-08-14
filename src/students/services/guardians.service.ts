import { Injectable, NotFoundException } from '@nestjs/common';

import { GuardiansRepository } from '../repositories/guardians.repository';
import { CreateGuardianDto } from '../dto/create-guardian.dto';
import { UpdateGuardianDto } from '../dto/update-guardian.dto';
import { GuardianEntity } from '../entities/guardian.entity';

@Injectable()
export class GuardiansService {
  constructor(private readonly guardiansRepository: GuardiansRepository) {}

  async create(dto: CreateGuardianDto): Promise<GuardianEntity> {
    return this.guardiansRepository.create(dto);
  }

  async findAllByStudentProfileId(
    studentProfileId: string,
  ): Promise<GuardianEntity[]> {
    return this.guardiansRepository.findAllByStudentProfileId(studentProfileId);
  }

  async update(id: string, dto: UpdateGuardianDto): Promise<GuardianEntity> {
    const guardian = await this.guardiansRepository.update(id, dto);
    if (!guardian) {
      throw new NotFoundException('Responsável não encontrado');
    }
    return guardian;
  }

  async remove(id: string): Promise<void> {
    await this.guardiansRepository.remove(id);
  }
}
