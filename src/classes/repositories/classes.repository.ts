import { Injectable } from '@nestjs/common';
import { Class, Prisma, StudentClass } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { isRecordNotFoundError } from '../../common/utils/prisma-error.util';
import { ClassEntity } from '../entities/class.entity';
import { StudentClassEntity } from '../entities/student-class.entity';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';

@Injectable()
export class ClassesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateClassDto): Promise<ClassEntity> {
    const classRecord = await this.prisma.class.create({ data });
    return this.toClassEntity(classRecord);
  }

  async findAll(): Promise<ClassEntity[]> {
    const classes = await this.prisma.class.findMany();
    return classes.map((classRecord) => this.toClassEntity(classRecord));
  }

  async findById(id: string): Promise<ClassEntity | null> {
    const classRecord = await this.prisma.class.findUnique({ where: { id } });
    return classRecord ? this.toClassEntity(classRecord) : null;
  }

  async update(id: string, data: UpdateClassDto): Promise<ClassEntity | null> {
    try {
      const classRecord = await this.prisma.class.update({
        where: { id },
        data,
      });
      return this.toClassEntity(classRecord);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.class.delete({ where: { id } });
    } catch (error) {
      if (!isRecordNotFoundError(error)) {
        throw error;
      }
    }
  }

  async addStudent(
    classId: string,
    enrollmentId: string,
  ): Promise<StudentClassEntity> {
    const studentClass = await this.prisma.studentClass.create({
      data: { classId, enrollmentId },
    });
    return this.toStudentClassEntity(studentClass);
  }

  async findStudentsByClassId(classId: string): Promise<StudentClassEntity[]> {
    const studentClasses = await this.prisma.studentClass.findMany({
      where: { classId },
    });
    return studentClasses.map((studentClass) =>
      this.toStudentClassEntity(studentClass),
    );
  }

  async removeStudent(classId: string, enrollmentId: string): Promise<void> {
    try {
      await this.prisma.studentClass.delete({
        where: { enrollmentId_classId: { enrollmentId, classId } },
      });
    } catch (error) {
      if (!isRecordNotFoundError(error)) {
        throw error;
      }
    }
  }

  private toClassEntity(classRecord: Class): ClassEntity {
    return Object.assign(new ClassEntity(), classRecord);
  }

  private toStudentClassEntity(studentClass: StudentClass): StudentClassEntity {
    return Object.assign(new StudentClassEntity(), studentClass);
  }
}
