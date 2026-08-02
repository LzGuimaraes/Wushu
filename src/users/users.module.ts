import { Module } from '@nestjs/common';

import {UsersController} from './controllers/users.controller';
import {UsersService} from './services/users.service';

import {UsersRepository} from './repositories/users.repository';
import {PrismaUsersRepository} from './repositories/prisma-users.repository';

@Module({
    controllers: [UsersController],
    providers: [
        UsersService,
        {
         provide: UsersRepository,
         useClass: PrismaUsersRepository,   
        },
    ],
    exports: [UsersService],
})
export class UsersModule {}