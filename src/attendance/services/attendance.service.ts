import { Injectable, NotFoundException } from '@nestjs/common';

import { AttendanceRepository } from '../repositories/attendance.repository';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { AttendanceEntity } from '../entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async create(dto: CreateAttendanceDto): Promise<AttendanceEntity> {
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

  async remove(id: string): Promise<void> {
    await this.attendanceRepository.remove(id);
  }
}
