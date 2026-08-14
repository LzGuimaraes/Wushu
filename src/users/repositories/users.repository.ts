import { UserStatus } from '../../common/enums/user-status.enum';
import { CreateUserDto} from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

export interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  studentProfile: {
    id: string;
    phone: string | null;
    belt: string | null;
    goal: string | null;
  } | null;
}

export abstract class UsersRepository {
    abstract create(data:CreateUserDto): Promise<UserEntity>;
    abstract findAll(): Promise<UserEntity[]>;
    abstract findById(id: string): Promise<UserEntity | null>;
    abstract findByEmail(email:string): Promise<UserEntity | null>;

    abstract update(id: string, data: UpdateUserDto): Promise<UserEntity | null>;

    abstract remove(id:string): Promise<void>;

    abstract markEmailVerified(id: string): Promise<UserEntity | null>;

    abstract updateStatus(id: string, status: UserStatus): Promise<UserEntity | null>;

    abstract updateManyStatus(ids: string[], status: UserStatus): Promise<number>;

    abstract findPendingRegistrations(): Promise<PendingRegistration[]>;
}
