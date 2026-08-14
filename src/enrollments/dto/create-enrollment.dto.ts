import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { EnrollmentStatus } from '../../common/enums/enrollment-status.enum';

export class CreateEnrollmentDto {
  @IsUUID()
  studentId: string;

  @IsNotEmpty()
  @IsString()
  enrollmentNumber: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @Type(() => Date)
  @IsDate()
  registrationDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
