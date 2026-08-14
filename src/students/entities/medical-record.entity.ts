export class MedicalRecordEntity {
  id: string;
  studentProfileId: string;
  hasDisease: boolean;
  diseaseDescription: string | null;
  usesMedication: boolean;
  medicationDescription: string | null;
  hasPhysicalLimitation: boolean;
  physicalLimitationDescription: string | null;
  hasAllergy: boolean;
  allergyDescription: string | null;
  hasPreviousInjury: boolean;
  previousInjuryDescription: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<MedicalRecordEntity> = {}) {
    Object.assign(this, partial);
  }
}
