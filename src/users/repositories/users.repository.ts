import { CreateUserDto} from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

export abstract class UsersRepository {
    abstract create(data:CreateUserDto): Promise<UserEntity>;
    abstract findAll(): Promise<UserEntity[]>;
    abstract findById(id: string): Promise<UserEntity | null>;
    abstract findByEmail(email:string): Promise<UserEntity | null>;

    abstract update(id: string, data: UpdateUserDto): Promise<UserEntity | null>;

    abstract remove(id:string): Promise<void>;
}
