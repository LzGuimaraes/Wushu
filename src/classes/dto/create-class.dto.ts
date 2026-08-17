import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateClassDto {
  /**
   * Obrigatório apenas quando quem cria é ADMIN.
   * Instrutor tem o próprio id definido automaticamente no servidor.
   */
  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  schedule?: string;
}
