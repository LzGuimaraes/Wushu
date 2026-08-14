import { Injectable } from '@nestjs/common';
import { Enrollment, Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { isRecordNotFoundError } from '../../common/utils/prisma-error.util';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEnrollmentDto): Promise<EnrollmentEntity> {
    const enrollment = await this.prisma.enrollment.create({
      data: data as unknown as Prisma.EnrollmentUncheckedCreateInput,
    });
    return this.toEntity(enrollment);
  }

  async findAll(): Promise<EnrollmentEntity[]> {
    const enrollments = await this.prisma.enrollment.findMany();
    return enrollments.map((enrollment) => this.toEntity(enrollment));
  }

  async findByStudentId(studentId: string): Promise<EnrollmentEntity[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
    });
    return enrollments.map((enrollment) => this.toEntity(enrollment));
  }

  async findById(id: string): Promise<EnrollmentEntity | null> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });
    return enrollment ? this.toEntity(enrollment) : null;
  }

  async update(
    id: string,
    data: UpdateEnrollmentDto,
  ): Promise<EnrollmentEntity | null> {
    try {
      const enrollment = await this.prisma.enrollment.update({
        where: { id },
        data: data as unknown as Prisma.EnrollmentUncheckedUpdateInput,
      });
      return this.toEntity(enrollment);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async approve(id: string): Promise<EnrollmentEntity> {
    const enrollment = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.enrollment.findUniqueOrThrow({ where: { id } });

      const studentProfile = await tx.studentProfile.findUniqueOrThrow({
        where: { id: existing.studentId },
      });

      await tx.user.update({
        where: { id: studentProfile.userId },
        data: { status: 'ACTIVE' },
      });

      return tx.enrollment.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });
    });

    return this.toEntity(enrollment);
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.enrollment.delete({ where: { id } });
    } catch (error) {
      if (!isRecordNotFoundError(error)) {
        throw error;
      }
    }
  }

  private toEntity(enrollment: Enrollment): EnrollmentEntity {
    return Object.assign(new EnrollmentEntity(), enrollment);
  }
}
