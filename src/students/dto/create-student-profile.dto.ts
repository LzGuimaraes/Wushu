import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { StudentGoal } from '../../common/enums/student-goal.enum';

export class CreateStudentProfileDto {
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(11)
  cpf: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  responsiblePhone?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  district: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  zipCode: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  belt?: string;

  @IsNotEmpty()
  @IsString()
  trainingModality: string;

  @IsOptional()
  @IsBoolean()
  hasPreviousMartialArt?: boolean;

  @IsOptional()
  @IsString()
  previousMartialArt?: string;

  @IsNotEmpty()
  @IsEnum(StudentGoal)
  goal: StudentGoal;

  @IsOptional()
  @IsString()
  goalDescription?: string;
}
