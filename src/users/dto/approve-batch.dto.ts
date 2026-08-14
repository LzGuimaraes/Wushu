import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ApproveBatchDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  ids: string[];
}
