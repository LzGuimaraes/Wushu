import {Injectable} from '@nestjs/common';
import { PrismaService} from '../../databse/prisma/prisma.service';
import { UsersRepository} from './users.repository';

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
    constructor(private readonly prisma: PrismaService,

    ) {
        super();
    }
}