import { EnrollmentStatus } from '../../common/enums/enrollment-status.enum';

export class EnrollmentEntity {
  id: string;
  studentId: string;
  enrollmentNumber: string;
  status: EnrollmentStatus;
  registrationDate: Date;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<EnrollmentEntity> = {}) {
    Object.assign(this, partial);
  }
}
