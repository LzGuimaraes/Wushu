export class BeltHistoryEntity {
  id: string;
  studentProfileId: string;
  belt: string;
  graduationDate: Date | null;
  notes: string | null;
  createdAt: Date;

  constructor(partial: Partial<BeltHistoryEntity> = {}) {
    Object.assign(this, partial);
  }
}
