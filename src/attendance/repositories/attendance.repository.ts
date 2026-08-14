import { Injectable } from '@nestjs/common';
import { Attendance } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { isRecordNotFoundError } from '../../common/utils/prisma-error.util';
import { AttendanceEntity } from '../entities/attendance.entity';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAttendanceDto): Promise<AttendanceEntity> {
    const attendance = await this.prisma.attendance.create({ data });
    return this.toEntity(attendance);
  }

  async findAll(): Promise<AttendanceEntity[]> {
    const attendances = await this.prisma.attendance.findMany();
    return attendances.map((attendance) => this.toEntity(attendance));
  }

  async findByClassId(classId: string): Promise<AttendanceEntity[]> {
    const attendances = await this.prisma.attendance.findMany({
      where: { classId },
    });
    return attendances.map((attendance) => this.toEntity(attendance));
  }

  async findById(id: string): Promise<AttendanceEntity | null> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });
    return attendance ? this.toEntity(attendance) : null;
  }

  async update(
    id: string,
    data: UpdateAttendanceDto,
  ): Promise<AttendanceEntity | null> {
    try {
      const attendance = await this.prisma.attendance.update({
        where: { id },
        data,
      });
      return this.toEntity(attendance);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.attendance.delete({ where: { id } });
    } catch (error) {
      if (!isRecordNotFoundError(error)) {
        throw error;
      }
    }
  }

  private toEntity(attendance: Attendance): AttendanceEntity {
    return Object.assign(new AttendanceEntity(), attendance);
  }
}
