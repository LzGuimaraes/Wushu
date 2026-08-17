import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { assertAdminOrInstructor } from '../../common/utils/authorization.util';
import {
  currentMonth,
  generatePendingMonthlyPayments,
} from '../../common/utils/monthly-payments.util';
import { EnrollmentStatus } from '../../common/enums/enrollment-status.enum';
import {
  EnrollmentsRepository,
  EnrollmentWithClasses,
} from '../repositories/enrollments.repository';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';
import { EnrollmentEntity } from '../entities/enrollment.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /** ADMIN ou instrutor cria matrícula; matrícula já ATIVA gera mensalidade do mês. */
  async create(
    user: AuthenticatedUser,
    dto: CreateEnrollmentDto,
  ): Promise<EnrollmentEntity> {
    await assertAdminOrInstructor(this.prisma.class, user);

    const enrollment = await this.enrollmentsRepository.create(dto);
    if (enrollment.status === EnrollmentStatus.ACTIVE) {
      await generatePendingMonthlyPayments(this.prisma, currentMonth(), {
        enrollmentId: enrollment.id,
      });
    }
    return enrollment;
  }

  async findAll(): Promise<EnrollmentEntity[]> {
    return this.enrollmentsRepository.findAll();
  }

  async findByStudentId(studentId: string): Promise<EnrollmentEntity[]> {
    return this.enrollmentsRepository.findByStudentId(studentId);
  }

  /** Matrículas do usuário com as turmas associadas (Minhas turmas). */
  async findMineWithClasses(
    studentId: string,
  ): Promise<EnrollmentWithClasses[]> {
    return this.enrollmentsRepository.findByStudentIdWithClasses(studentId);
  }

  async findOne(id: string): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentsRepository.findById(id);
    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }
    return enrollment;
  }

  async update(
    id: string,
    dto: UpdateEnrollmentDto,
  ): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentsRepository.update(id, dto);
    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }
    return enrollment;
  }

  /** Aprova a matrícula (ativa aluno e matrícula) e gera a mensalidade do mês. */
  async approve(id: string): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentsRepository.approve(id);
    await generatePendingMonthlyPayments(this.prisma, currentMonth(), {
      enrollmentId: enrollment.id,
    });
    return enrollment;
  }

  async remove(id: string): Promise<void> {
    await this.enrollmentsRepository.remove(id);
  }
}
