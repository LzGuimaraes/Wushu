import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateStudentProfileDto } from './create-student-profile.dto';

export class UpdateStudentProfileDto extends PartialType(
  OmitType(CreateStudentProfileDto, ['userId'] as const),
) {}
