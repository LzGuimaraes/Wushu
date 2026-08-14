import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateGuardianDto {
  @IsUUID()
  studentProfileId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(14)
  cpf: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsString()
  signatureUrl?: string;
}
