import { StudentGoal } from '../../common/enums/student-goal.enum';

export class StudentProfileEntity {
  id: string;
  userId: string;
  cpf: string;
  birthDate: Date | null;
  phone: string;
  responsiblePhone: string | null;
  address: string;
  district: string;
  city: string;
  zipCode: string;
  emergencyContact: string | null;
  belt: string | null;
  trainingModality: string;
  hasPreviousMartialArt: boolean;
  previousMartialArt: string | null;
  goal: StudentGoal;
  goalDescription: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<StudentProfileEntity> = {}) {
    Object.assign(this, partial);
  }
}
