import { Transform } from 'class-transformer';
import { StudentGoal } from '../../common/enums/student-goal.enum';

/** Serializa uma data UTC apenas como YYYY-MM-DD, evitando ambiguidade de fuso. */
const toDateOnly = ({ value }: { value: Date | null }): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

export class StudentProfileEntity {
  id: string;
  userId: string;
  cpf: string;
  /** Retornado como YYYY-MM-DD na API (input type="date" do front). */
  @Transform(toDateOnly)
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
