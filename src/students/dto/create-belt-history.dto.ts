import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBeltHistoryDto {
  @IsUUID()
  studentProfileId: string;

  @IsNotEmpty()
  @IsString()
  belt: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  graduationDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
