import { IsBoolean } from 'class-validator';

export class UpdateAttendanceDto {
  @IsBoolean()
  present: boolean;
}
