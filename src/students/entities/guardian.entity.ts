export class GuardianEntity {
  id: string;
  studentProfileId: string;
  name: string;
  cpf: string;
  phone: string;
  signatureUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<GuardianEntity> = {}) {
    Object.assign(this, partial);
  }
}
