import {UserRole} from "../../common/enums/user-role.enum";
import {UserStatus} from "../../common/enums/user-status.enum";

export class UserEntity{
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