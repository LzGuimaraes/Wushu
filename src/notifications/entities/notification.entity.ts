import { NotificationStatus } from '../../common/enums/notification-status.enum';
import { NotificationType } from '../../common/enums/notification-type.enum';

export class NotificationEntity {
  id: string;
  userId: string;
  type: NotificationType;
  subject: string;
  body: string;
  status: NotificationStatus;
  sentAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<NotificationEntity> = {}) {
    Object.assign(this, partial);
  }
}
