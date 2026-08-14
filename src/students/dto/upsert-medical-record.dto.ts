import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpsertMedicalRecordDto {
  @IsOptional()
  @IsBoolean()
  hasDisease?: boolean;

  @IsOptional()
  @IsString()
  diseaseDescription?: string;

  @IsOptional()
  @IsBoolean()
  usesMedication?: boolean;

  @IsOptional()
  @IsString()
  medicationDescription?: string;

  @IsOptional()
  @IsBoolean()
  hasPhysicalLimitation?: boolean;

  @IsOptional()
  @IsString()
  physicalLimitationDescription?: string;

  @IsOptional()
  @IsBoolean()
  hasAllergy?: boolean;

  @IsOptional()
  @IsString()
  allergyDescription?: string;

  @IsOptional()
  @IsBoolean()
  hasPreviousInjury?: boolean;

  @IsOptional()
  @IsString()
  previousInjuryDescription?: string;
}
