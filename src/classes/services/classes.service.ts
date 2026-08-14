import { Injectable, NotFoundException } from '@nestjs/common';

import { ClassesRepository } from '../repositories/classes.repository';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { ClassEntity } from '../entities/class.entity';
import { StudentClassEntity } from '../entities/student-class.entity';

@Injectable()
export class ClassesService {
  constructor(private readonly classesRepository: ClassesRepository) {}

  async create(dto: CreateClassDto): Promise<ClassEntity> {
    return this.classesRepository.create(dto);
  }

  async findAll(): Promise<ClassEntity[]> {
    return this.classesRepository.findAll();
  }

  async findOne(id: string): Promise<ClassEntity> {
    const classRecord = await this.classesRepository.findById(id);
    if (!classRecord) {
      throw new NotFoundException('Turma não encontrada');
    }
    return classRecord;
  }

  async update(id: string, dto: UpdateClassDto): Promise<ClassEntity> {
    const classRecord = await this.classesRepository.update(id, dto);
    if (!classRecord) {
      throw new NotFoundException('Turma não encontrada');
    }
    return classRecord;
  }

  async remove(id: string): Promise<void> {
    await this.classesRepository.remove(id);
  }

  async addStudent(
    classId: string,
    enrollmentId: string,
  ): Promise<StudentClassEntity> {
    return this.classesRepository.addStudent(classId, enrollmentId);
  }

  async findStudentsByClassId(classId: string): Promise<StudentClassEntity[]> {
    return this.classesRepository.findStudentsByClassId(classId);
  }

  async removeStudent(classId: string, enrollmentId: string): Promise<void> {
    await this.classesRepository.removeStudent(classId, enrollmentId);
  }
}
