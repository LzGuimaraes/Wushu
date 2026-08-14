import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity> = {}) {
    Object.assign(this, partial);
  }
}

/** Usuário sem o hash da senha — é o que pode sair em qualquer resposta HTTP. */
export type PublicUser = Omit<UserEntity, 'password'>;

export function toPublicUser(user: UserEntity): PublicUser {
  const publicUser = { ...user };
  delete (publicUser as Partial<UserEntity>).password;
  return publicUser as PublicUser;
}
