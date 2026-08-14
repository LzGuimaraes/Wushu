import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { UserStatus } from '../enums/user-status.enum';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Autenticação JWT + bloqueio de contas não aprovadas.
 * Todo endpoint que exige login também exige conta com status ACTIVE —
 * um aluno PENDING/INACTIVE/SUSPENDED recebe 403 (tela de espera no front).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Não autenticado');
    }

    const authenticated = user as unknown as AuthenticatedUser;
    if (
      authenticated.status &&
      authenticated.status !== UserStatus.ACTIVE
    ) {
      const request = context
        .switchToHttp()
        .getRequest<Request & { user?: AuthenticatedUser }>();
      request.user = authenticated;
      throw new ForbiddenException(
        'Sua conta ainda não foi aprovada. Aguarde a aprovação do professor.',
      );
    }

    return user;
  }
}
