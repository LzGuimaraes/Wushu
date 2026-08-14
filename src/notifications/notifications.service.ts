import { Injectable } from '@nestjs/common';

import { NotificationsRepository } from './notifications.repository';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationType } from '../common/enums/notification-type.enum';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    subject: string,
    body: string,
  ): Promise<NotificationEntity> {
    return this.notificationsRepository.create({ userId, type, subject, body });
  }

  /** Cria uma notificação para cada administrador (aviso de cadastro novo, etc). */
  async notifyAdmins(
    type: NotificationType,
    subject: string,
    body: string,
  ): Promise<void> {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    await Promise.all(
      admins.map((admin) =>
        this.notificationsRepository.create({
          userId: admin.id,
          type,
          subject,
          body,
        }),
      ),
    );
  }

  async findMine(userId: string): Promise<NotificationEntity[]> {
    return this.notificationsRepository.findByUserId(userId);
  }
}
