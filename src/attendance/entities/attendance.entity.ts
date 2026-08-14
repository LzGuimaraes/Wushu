export class AttendanceEntity {
  id: string;
  enrollmentId: string;
  classId: string;
  attendanceDate: Date;
  present: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AttendanceEntity> = {}) {
    Object.assign(this, partial);
  }
}
