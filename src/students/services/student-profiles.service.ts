import { Injectable, NotFoundException } from '@nestjs/common';

import { StudentProfilesRepository } from '../repositories/student-profiles.repository';
import { CreateStudentProfileDto } from '../dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from '../dto/update-student-profile.dto';
import { StudentProfileEntity } from '../entities/student-profile.entity';

@Injectable()
export class StudentProfilesService {
  constructor(
    private readonly studentProfilesRepository: StudentProfilesRepository,
  ) {}

  async create(dto: CreateStudentProfileDto): Promise<StudentProfileEntity> {
    return this.studentProfilesRepository.create(dto);
  }

  async findAll(): Promise<StudentProfileEntity[]> {
    return this.studentProfilesRepository.findAll();
  }

  async findOne(id: string): Promise<StudentProfileEntity> {
    const profile = await this.studentProfilesRepository.findById(id);
    if (!profile) {
      throw new NotFoundException('Perfil de aluno não encontrado');
    }
    return profile;
  }

  async findByUserId(userId: string): Promise<StudentProfileEntity> {
    const profile = await this.studentProfilesRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil de aluno não encontrado');
    }
    return profile;
  }

  /** Atualiza o perfil do próprio usuário logado (PATCH /students/me). */
  async updateByUserId(
    userId: string,
    dto: UpdateStudentProfileDto,
  ): Promise<StudentProfileEntity> {
    const profile = await this.studentProfilesRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil de aluno não encontrado');
    }
    const updated = await this.studentProfilesRepository.update(profile.id, dto);
    if (!updated) {
      throw new NotFoundException('Perfil de aluno não encontrado');
    }
    return updated;
  }

  async update(
    id: string,
    dto: UpdateStudentProfileDto,
  ): Promise<StudentProfileEntity> {
    const profile = await this.studentProfilesRepository.update(id, dto);
    if (!profile) {
      throw new NotFoundException('Perfil de aluno não encontrado');
    }
    return profile;
  }

  async remove(id: string): Promise<void> {
    await this.studentProfilesRepository.remove(id);
  }
}
