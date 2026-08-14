import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Atualização do próprio perfil (PATCH /users/me).
 * - `name`: nome de exibição.
 * - `currentPassword` + `newPassword`: troca de senha exige a senha atual.
 */
export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  newPassword?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  confirmNewPassword?: string;
}
