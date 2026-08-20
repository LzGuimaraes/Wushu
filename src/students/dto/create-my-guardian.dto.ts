import { OmitType } from '@nestjs/mapped-types';

import { CreateGuardianDto } from './create-guardian.dto';

/**
 * Corpo do responsável criado pelo próprio aluno (POST /guardians/me).
 * O `studentProfileId` é resolvido no controller a partir do usuário
 * autenticado — o cliente não deve enviá-lo.
 */
export class CreateMyGuardianDto extends OmitType(CreateGuardianDto, [
  'studentProfileId',
] as const) {}
