export class StudentClassEntity {
  id: string;
  enrollmentId: string;
  classId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<StudentClassEntity> = {}) {
    Object.assign(this, partial);
  }
}
