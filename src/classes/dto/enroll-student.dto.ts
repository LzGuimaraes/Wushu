import { IsUUID } from 'class-validator';

export class EnrollStudentDto {
  @IsUUID()
  enrollmentId: string;
}
