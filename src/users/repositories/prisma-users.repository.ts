import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { UserStatus } from '../../common/enums/user-status.enum';
import { UsersRepository, PendingRegistration } from './users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.create({ data });
    return this.toEntity(user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.toEntity(user));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      return this.toEntity(user);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (!this.isNotFoundError(error)) {
        throw error;
      }
    }
  }

  async markEmailVerified(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { emailVerifiedAt: new Date() },
      });
      return this.toEntity(user);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: UserStatus,
  ): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { status },
      });
      return this.toEntity(user);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async updateManyStatus(
    ids: string[],
    status: UserStatus,
  ): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await this.prisma.user.updateMany({
      where: { id: { in: ids }, status: { not: status } },
      data: { status },
    });
    return result.count;
  }

  async findPendingRegistrations(): Promise<PendingRegistration[]> {
    const users = await this.prisma.user.findMany({
      where: { status: 'PENDING' },
      include: {
        studentProfile: {
          select: { id: true, phone: true, belt: true, goal: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      studentProfile: user.studentProfile
        ? {
            id: user.studentProfile.id,
            phone: user.studentProfile.phone,
            belt: user.studentProfile.belt,
            goal: user.studentProfile.goal,
          }
        : null,
    }));
  }

  private toEntity(user: User): UserEntity {
    return Object.assign(new UserEntity(), user);
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }
}