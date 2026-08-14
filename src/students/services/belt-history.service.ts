import { Injectable } from '@nestjs/common';

import { BeltHistoryRepository } from '../repositories/belt-history.repository';
import { CreateBeltHistoryDto } from '../dto/create-belt-history.dto';
import { BeltHistoryEntity } from '../entities/belt-history.entity';

@Injectable()
export class BeltHistoryService {
  constructor(private readonly beltHistoryRepository: BeltHistoryRepository) {}

  async create(dto: CreateBeltHistoryDto): Promise<BeltHistoryEntity> {
    return this.beltHistoryRepository.create(dto);
  }

  async findAllByStudentProfileId(
    studentProfileId: string,
  ): Promise<BeltHistoryEntity[]> {
    return this.beltHistoryRepository.findAllByStudentProfileId(studentProfileId);
  }

  async remove(id: string): Promise<void> {
    await this.beltHistoryRepository.remove(id);
  }
}
