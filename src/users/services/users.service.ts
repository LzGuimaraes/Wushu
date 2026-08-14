import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import {
  PendingRegistration,
  UsersRepository,
} from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateMeDto } from '../dto/update-me.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(data: CreateUserDto): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.usersRepository.create({ ...data, password: hashedPassword });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(email);
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity | null> {
    const payload = { ...data };
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    return this.usersRepository.update(id, payload);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.remove(id);
  }

  async markEmailVerified(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.markEmailVerified(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  /**
   * Atualiza os próprios dados (PATCH /users/me).
   * - Nome pode ser alterado livremente.
   * - Troca de senha exige a senha atual.
   */
  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserEntity> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const data: UpdateUserDto = {};
    if (dto.name) {
      data.name = dto.name;
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'Informe sua senha atual para trocar a senha',
        );
      }
      if (dto.newPassword !== dto.confirmNewPassword) {
        throw new BadRequestException('A confirmação da nova senha não confere');
      }
      const matches = await bcrypt.compare(dto.currentPassword, user.password);
      if (!matches) {
        throw new UnauthorizedException('Senha atual incorreta');
      }
      data.password = await bcrypt.hash(dto.newPassword, 10);
    }

    const updated = await this.usersRepository.update(userId, data);
    if (!updated) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return updated;
  }

  async findPendingRegistrations(): Promise<PendingRegistration[]> {
    return this.usersRepository.findPendingRegistrations();
  }

  /** Aprova a conta de um aluno (status -> ACTIVE) e o notifica. */
  async approve(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.updateStatus(id, UserStatus.ACTIVE);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.notificationsService.create(
      user.id,
      NotificationType.ENROLLMENT_APPROVED,
      'Sua matrícula foi aprovada!',
      'Sua conta foi aprovada pelo professor. Agora você já pode acessar o portal do aluno.',
    );
    return user;
  }

  /** Rejeita a conta (status -> INACTIVE) registrando o motivo em notificação. */
  async reject(id: string, reason: string): Promise<UserEntity> {
    const user = await this.usersRepository.updateStatus(
      id,
      UserStatus.INACTIVE,
    );
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.notificationsService.create(
      user.id,
      NotificationType.GENERAL,
      'Seu cadastro não foi aprovado',
      reason,
    );
    return user;
  }

  /** Aprova várias contas em lote. Retorna quantas foram alteradas. */
  async approveBatch(ids: string[]): Promise<{ approved: number }> {
    const approved = await this.usersRepository.updateManyStatus(
      ids,
      UserStatus.ACTIVE,
    );
    const users = await this.usersRepository.findAll();
    const targets = users.filter((u) => ids.includes(u.id));
    await Promise.all(
      targets.map((user) =>
        this.notificationsService.create(
          user.id,
          NotificationType.ENROLLMENT_APPROVED,
          'Sua matrícula foi aprovada!',
          'Sua conta foi aprovada pelo professor. Agora você já pode acessar o portal do aluno.',
        ),
      ),
    );
    return { approved };
  }
}
