import { ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { UserRole } from '../enums/user-role.enum';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

type ClassDelegate = PrismaClient['class'];

/**
 * ADMIN passa direto; qualquer outro usuário precisa ser instrutor
 * (dono de ao menos uma turma) para executar a ação.
 */
export async function assertAdminOrInstructor(
  classDelegate: ClassDelegate,
  user: AuthenticatedUser,
): Promise<void> {
  if (user.role === UserRole.ADMIN) return;

  const count = await classDelegate.count({
    where: { instructorId: user.userId },
  });

  if (count === 0) {
    throw new ForbiddenException(
      'Apenas administradores ou instrutores podem realizar esta ação',
    );
  }
}

/**
 * Garante que o usuário é ADMIN ou o instrutor da turma informada.
 * Usado para proteger endpoints que mexem em uma turma específica.
 */
export async function assertClassInstructorOrAdmin(
  classDelegate: ClassDelegate,
  user: AuthenticatedUser,
  classId: string,
): Promise<void> {
  if (user.role === UserRole.ADMIN) return;

  const count = await classDelegate.count({
    where: { id: classId, instructorId: user.userId },
  });

  if (count === 0) {
    throw new ForbiddenException(
      'Você não tem permissão para acessar esta turma',
    );
  }
}
