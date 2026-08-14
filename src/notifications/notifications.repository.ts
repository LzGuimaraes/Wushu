import { Injectable } from '@nestjs/common';
import { Notification as PrismaNotification } from '@prisma/client';

import { PrismaService } from '../database/prisma/prisma.service';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    subject: string;
    body: string;
  }): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        subject: data.subject,
        body: data.body,
      },
    });
    return this.toEntity(notification);
  }

  async findManyByUserIds(userIds: string[]): Promise<NotificationEntity[]> {
    if (userIds.length === 0) return [];
    const notifications = await this.prisma.notification.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map((n) => this.toEntity(n));
  }

  async findByUserId(userId: string): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map((n) => this.toEntity(n));
  }

  private toEntity(notification: PrismaNotification): NotificationEntity {
    return Object.assign(new NotificationEntity(), notification);
  }
}
