import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID()
  enrollmentId: string;

  @IsUUID()
  classId: string;

  @Type(() => Date)
  @IsDate()
  attendanceDate: Date;

  @IsOptional()
  @IsBoolean()
  present?: boolean;
}
