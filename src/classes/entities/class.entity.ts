export class ClassEntity {
  id: string;
  instructorId: string;
  name: string;
  description: string | null;
  schedule: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ClassEntity> = {}) {
    Object.assign(this, partial);
  }
}
