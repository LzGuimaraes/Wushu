import { OmitType } from '@nestjs/mapped-types';

import { CreateStudentProfileDto } from './create-student-profile.dto';

export class CompleteStudentProfileDto extends OmitType(CreateStudentProfileDto, [
  'userId',
] as const) {}
