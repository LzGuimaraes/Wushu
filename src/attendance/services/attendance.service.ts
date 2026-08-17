import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { assertClassInstructorOrAdmin } from '../../common/utils/authorization.util';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { AttendanceEntity } from '../entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateAttendanceDto): Promise<AttendanceEntity> {
    return this.attendanceRepository.create(dto);
  }

  /** Registra frequência validando que o usuário é ADMIN ou instrutor da turma. */
  async createAs(
    user: AuthenticatedUser,
    dto: CreateAttendanceDto,
  ): Promise<AttendanceEntity> {
    await assertClassInstructorOrAdmin(this.prisma.class, user, dto.classId);
    return this.attendanceRepository.create(dto);
  }

  async findAll(): Promise<AttendanceEntity[]> {
    return this.attendanceRepository.findAll();
  }

  async findByClassId(classId: string): Promise<AttendanceEntity[]> {
    return this.attendanceRepository.findByClassId(classId);
  }

  async findOne(id: string): Promise<AttendanceEntity> {
    const attendance = await this.attendanceRepository.findById(id);
    if (!attendance) {
      throw new NotFoundException('Registro de frequência não encontrado');
    }
    return attendance;
  }

  async update(
    id: string,
    dto: UpdateAttendanceDto,
  ): Promise<AttendanceEntity> {
    const attendance = await this.attendanceRepository.update(id, dto);
    if (!attendance) {
      throw new NotFoundException('Registro de frequência não encontrado');
    }
    return attendance;
  }

  /** Edita frequência validando que o usuário é ADMIN ou instrutor da turma. */
  async updateAs(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateAttendanceDto,
  ): Promise<AttendanceEntity> {
    const attendance = await this.findOne(id);
    await assertClassInstructorOrAdmin(
      this.prisma.class,
      user,
      attendance.classId,
    );
    const updated = await this.attendanceRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Registro de frequência não encontrado');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.attendanceRepository.remove(id);
  }
}
