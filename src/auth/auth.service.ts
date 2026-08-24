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

@Injectable()
export class AuthService {
  private readonly appUrl: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    this.frontendUrl =
      process.env.DOMAIN_WEB ??
      process.env.FRONTEND_URL ??
      process.env.APP_URL ??
      'http://localhost:3000';
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; user: PublicUser }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: toPublicUser(user),
    };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ accessToken: string; user: PublicUser; message: string }> {
    const user = await this.usersService.create(dto);
    await this.sendConfirmationEmail(user);
    await this.notificationsService.notifyAdmins(
      NotificationType.REGISTRATION,
      'Novo cadastro aguardando aprovação',
      `O aluno "${user.name}" (${user.email}) se cadastrou e aguarda sua aprovação.`,
    );

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: toPublicUser(user),
      message: 'Conta criada. Aguardando aprovação do professor.',
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

  private async sendConfirmationEmail(user: UserEntity): Promise<void> {
    const token = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'email-confirmation' },
      { expiresIn: '24h' },
    );
    const link = `${this.appUrl}/auth/confirm-email?token=${token}`;
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
