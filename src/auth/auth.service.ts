import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/services/users.service';
import {
  PublicUser,
  UserEntity,
  toPublicUser,
} from '../users/entities/user.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

interface ConfirmationPayload {
  sub: string;
  purpose: string;
}

interface RefreshPayload {
  sub: string;
  purpose: string;
}

/** Duração do refresh token (sessão "lembrada" máxima). */
const REFRESH_TOKEN_TTL = '7d';

@Injectable()
export class AuthService {
  private readonly frontendUrl: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.frontendUrl =
      process.env.DOMAIN_WEB ??
      process.env.FRONTEND_URL ??
      process.env.APP_URL ??
      'http://localhost:3000';

    this.refreshSecret =
      process.env.JWT_REFRESH_SECRET ??
      process.env.JWT_SECRET ??
      'dev-secret';

    if (!process.env.DOMAIN_WEB && !process.env.FRONTEND_URL) {
      // Sem DOMAIN_WEB/FRONTEND_URL, o link do e-mail aponta para o próprio
      // backend e quebra (404) ao ser aberto. Deixar isso visível evita
      // redefinições de senha quebradas em produção.
      console.warn(
        `[auth] DOMAIN_WEB/FRONTEND_URL não configurados — links de e-mail ` +
          `(redefinição de senha etc.) apontarão para o backend (${this.frontendUrl}) ` +
          `e não para o frontend. Configure DOMAIN_WEB com a URL pública do frontend.`,
      );
    }
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: PublicUser;
  }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      ...(await this.signTokens(user)),
      user: toPublicUser(user),
    };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: PublicUser;
    message: string;
  }> {
    const user = await this.usersService.create(dto);
    await this.sendConfirmationEmail(user);
    await this.notificationsService.notifyAdmins(
      NotificationType.REGISTRATION,
      'Novo cadastro aguardando aprovação',
      `O aluno "${user.name}" (${user.email}) se cadastrou e aguarda sua aprovação.`,
    );

    return {
      ...(await this.signTokens(user)),
      user: toPublicUser(user),
      message:
        'Conta criada! Enviamos um link de confirmação para o seu e-mail. Aguardando a aprovação do professor.',
    };
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    let payload: ConfirmationPayload;
    try {
      payload = await this.jwtService.verifyAsync<ConfirmationPayload>(token);
    } catch {
      throw new BadRequestException('Token inválido ou expirado');
    }

    if (payload.purpose !== 'email-confirmation' || !payload.sub) {
      throw new BadRequestException('Token inválido');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (!user.emailVerifiedAt) {
      await this.usersService.markEmailVerified(user.id);
    }

    return { message: 'E-mail confirmado com sucesso.' };
  }

  async resendConfirmation(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (user && !user.emailVerifiedAt) {
      await this.sendConfirmationEmail(user);
    }
    return {
      message:
        'Se o e-mail existir e ainda não estiver confirmado, o link foi reenviado.',
    };
  }

  /**
   * Envia o e-mail com o link para redefinir a senha.
   * A resposta é genérica para não revelar quais e-mails estão cadastrados.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      await this.sendPasswordResetEmail(user);
    }
    return {
      message:
        'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
    };
  }

  /** Verifica se o token de redefinição é válido (sem consumi-lo). */
  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    try {
      const payload =
        await this.jwtService.verifyAsync<ConfirmationPayload>(token);
      if (payload.purpose !== 'password-reset' || !payload.sub) {
        return { valid: false };
      }
      const user = await this.usersService.findById(payload.sub);
      return { valid: !!user };
    } catch {
      return { valid: false };
    }
  }

  /** Redefine a senha a partir do token enviado por e-mail. */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('A confirmação da nova senha não confere');
    }

    let payload: ConfirmationPayload;
    try {
      payload = await this.jwtService.verifyAsync<ConfirmationPayload>(
        dto.token,
      );
    } catch {
      throw new BadRequestException('Link inválido ou expirado');
    }

    if (payload.purpose !== 'password-reset' || !payload.sub) {
      throw new BadRequestException('Link inválido ou expirado');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // `UsersService.update` já aplica o bcrypt na senha — não podemos
    // pré-hashear aqui, senão a senha ficaria com hash duplo e o login falharia.
    const data: UpdateUserDto = { password: dto.password };
    await this.usersService.update(user.id, data);
    await this.notificationsService.create(
      user.id,
      NotificationType.PASSWORD_RESET,
      'Sua senha foi alterada',
      'Sua senha foi redefinida com sucesso. Caso não tenha sido você, entre em contato com a escola.',
    );

    return { message: 'Senha redefinida com sucesso.' };
  }

  /**
   * Emite um novo par de tokens a partir de um refresh token válido
   * (rotação: o refresh antigo deixa de ser usável quando o novo é emitido
   * pelo cliente).
   */
  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: PublicUser;
  }> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(
        refreshToken,
        { secret: this.refreshSecret },
      );
    } catch {
      throw new UnauthorizedException('Sessão expirada. Entre novamente.');
    }

    if (payload.purpose !== 'refresh' || !payload.sub) {
      throw new UnauthorizedException('Sessão inválida. Entre novamente.');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      ...(await this.signTokens(user)),
      user: toPublicUser(user),
    };
  }

  /** Gera o access token (curto) e o refresh token (longo) de um usuário. */
  private async signTokens(user: UserEntity): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessPayload = { sub: user.id, email: user.email, role: user.role };
    const refreshPayload = { sub: user.id, purpose: 'refresh' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.refreshSecret,
        expiresIn: REFRESH_TOKEN_TTL,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async sendConfirmationEmail(user: UserEntity): Promise<void> {
    const token = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'email-confirmation' },
      { expiresIn: '24h' },
    );
    const link = `${this.frontendUrl}/confirmar-email?token=${token}`;
    await this.mailService.sendConfirmationEmail(user.email, user.name, link);
  }

  private async sendPasswordResetEmail(user: UserEntity): Promise<void> {
    const token = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'password-reset' },
      { expiresIn: '1h' },
    );
    const link = `${this.frontendUrl}/redefinir-senha?token=${token}`;
    await this.mailService.sendPasswordResetEmail(user.email, user.name, link);
  }
}
