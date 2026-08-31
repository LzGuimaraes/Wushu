import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { isAllowedOrigin } from '../../config/frontend-origins';

/**
 * Bloqueia requisições que não venham do frontend oficial.
 * Usada em endpoints públicos sensíveis (ex.: cadastro) para impedir que
 * bots/clientes externos abusem da API. Valida o header `Origin` (ou, na
 * falta dele, o `Referer`).
 */
@Injectable()
export class FrontendOriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { headers: Record<string, unknown> }>();

    const origin = this.extractOrigin(request);
    if (!origin) {
      throw new ForbiddenException(
        'Acesso permitido apenas pelo site oficial.',
      );
    }

    if (!isAllowedOrigin(origin)) {
      throw new ForbiddenException('Origem não permitida.');
    }

    return true;
  }

  private extractOrigin(
    request: Request & { headers: Record<string, unknown> },
  ): string | null {
    const headers = request.headers ?? {};
    const candidates = [headers.origin, headers.referer].filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );

    for (const candidate of candidates) {
      try {
        return new URL(candidate).origin;
      } catch {
        // Tenta o próximo header.
      }
    }

    return null;
  }
}
