import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/services/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface ConfirmationPayload {
  sub: string;
  purpose: string;
}

@Injectable()
export class AuthService {
  private readonly appUrl: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {
    this.appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: UserEntity }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Confirme seu e-mail antes de entrar');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }

  async register(dto: RegisterDto): Promise<{ user: UserEntity; message: string }> {
    const user = await this.usersService.create(dto);
    await this.sendConfirmationEmail(user);
    return { user, message: 'Conta criada. Enviamos um e-mail de confirmação.' };
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

  private async sendConfirmationEmail(user: UserEntity): Promise<void> {
    const token = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'email-confirmation' },
      { expiresIn: '24h' },
    );
    const link = `${this.appUrl}/auth/confirm-email?token=${token}`;
    await this.mailService.sendConfirmationEmail(user.email, user.name, link);
  }
}
