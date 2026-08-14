import { Injectable } from '@nestjs/common';
import { Prisma, StudentProfile } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { isRecordNotFoundError } from '../../common/utils/prisma-error.util';
import { StudentProfileEntity } from '../entities/student-profile.entity';
import { CreateStudentProfileDto } from '../dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from '../dto/update-student-profile.dto';

@Injectable()
export class StudentProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStudentProfileDto): Promise<StudentProfileEntity> {
    const profile = await this.prisma.studentProfile.create({
      data: data as unknown as Prisma.StudentProfileUncheckedCreateInput,
    });
    return this.toEntity(profile);
  }

  async findAll(): Promise<StudentProfileEntity[]> {
    const profiles = await this.prisma.studentProfile.findMany();
    return profiles.map((profile) => this.toEntity(profile));
  }

  async findById(id: string): Promise<StudentProfileEntity | null> {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id },
    });
    return profile ? this.toEntity(profile) : null;
  }

  async findByUserId(userId: string): Promise<StudentProfileEntity | null> {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    return profile ? this.toEntity(profile) : null;
  }

  async update(
    id: string,
    data: UpdateStudentProfileDto,
  ): Promise<StudentProfileEntity | null> {
    try {
      const profile = await this.prisma.studentProfile.update({
        where: { id },
        data: data as unknown as Prisma.StudentProfileUncheckedUpdateInput,
      });
      return this.toEntity(profile);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.studentProfile.delete({ where: { id } });
    } catch (error) {
      if (!isRecordNotFoundError(error)) {
        throw error;
      }
    }
  }

  private toEntity(profile: StudentProfile): StudentProfileEntity {
    return Object.assign(new StudentProfileEntity(), profile);
  }
}
