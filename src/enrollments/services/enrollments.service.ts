import { Injectable, NotFoundException } from '@nestjs/common';

import {
  EnrollmentsRepository,
  EnrollmentWithClasses,
} from '../repositories/enrollments.repository';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';
import { EnrollmentEntity } from '../entities/enrollment.entity';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly enrollmentsRepository: EnrollmentsRepository) {}

  async create(dto: CreateEnrollmentDto): Promise<EnrollmentEntity> {
    return this.enrollmentsRepository.create(dto);
  }

  async findAll(): Promise<EnrollmentEntity[]> {
    return this.enrollmentsRepository.findAll();
  }

  async findByStudentId(studentId: string): Promise<EnrollmentEntity[]> {
    return this.enrollmentsRepository.findByStudentId(studentId);
  }

  /** Matrículas do usuário com as turmas associadas (Minhas turmas). */
  async findMineWithClasses(studentId: string): Promise<EnrollmentWithClasses[]> {
    return this.enrollmentsRepository.findByStudentIdWithClasses(studentId);
  }

  async findOne(id: string): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentsRepository.findById(id);
    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }
    return enrollment;
  }

  async update(id: string, dto: UpdateEnrollmentDto): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentsRepository.update(id, dto);
    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }
    return enrollment;
  }

  async approve(id: string): Promise<EnrollmentEntity> {
    return this.enrollmentsRepository.approve(id);
  }

  async remove(id: string): Promise<void> {
    await this.enrollmentsRepository.remove(id);
  }
}
