import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { UserRole } from '../../common/enums/user-role.enum';
import {
  assertAdminOrInstructor,
  assertClassInstructorOrAdmin,
} from '../../common/utils/authorization.util';
import { ClassesRepository } from '../repositories/classes.repository';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { ClassEntity } from '../entities/class.entity';
import { StudentClassEntity } from '../entities/student-class.entity';

@Injectable()
export class ClassesService {
  constructor(
    private readonly classesRepository: ClassesRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * ADMIN cria turma para qualquer instrutor; instrutor cria turma vinculada
   * a si mesmo (instructorId definido no servidor, nunca pelo cliente).
   */
  async create(
    user: AuthenticatedUser,
    dto: CreateClassDto,
  ): Promise<ClassEntity> {
    if (user.role === UserRole.ADMIN) {
      if (!dto.instructorId) {
        throw new BadRequestException(
          'Informe o instrutor responsável pela turma',
        );
      }
      return this.classesRepository.create({
        ...dto,
        instructorId: dto.instructorId,
      });
    }

    await assertAdminOrInstructor(this.prisma.class, user);
    return this.classesRepository.create({ ...dto, instructorId: user.userId });
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

  async update(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateClassDto,
  ): Promise<ClassEntity> {
    await assertClassInstructorOrAdmin(this.prisma.class, user, id);

    // Instrutor não pode transferir a turma para outro instrutor.
    const payload: UpdateClassDto =
      user.role === UserRole.ADMIN ? dto : { ...dto, instructorId: undefined };

    const classRecord = await this.classesRepository.update(id, payload);
    if (!classRecord) {
      throw new NotFoundException('Turma não encontrada');
    }
    return classRecord;
  }

  async remove(user: AuthenticatedUser, id: string): Promise<void> {
    await assertClassInstructorOrAdmin(this.prisma.class, user, id);
    await this.classesRepository.remove(id);
  }

  async addStudent(
    user: AuthenticatedUser,
    classId: string,
    enrollmentId: string,
  ): Promise<StudentClassEntity> {
    await assertClassInstructorOrAdmin(this.prisma.class, user, classId);
    return this.classesRepository.addStudent(classId, enrollmentId);
  }

  async findStudentsByClassId(classId: string): Promise<StudentClassEntity[]> {
    return this.classesRepository.findStudentsByClassId(classId);
  }

  async removeStudent(
    user: AuthenticatedUser,
    classId: string,
    enrollmentId: string,
  ): Promise<void> {
    await assertClassInstructorOrAdmin(this.prisma.class, user, classId);
    await this.classesRepository.removeStudent(classId, enrollmentId);
  }
}
