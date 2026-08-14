import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PublicUser, toPublicUser } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<PublicUser> {
    return toPublicUser(await this.usersService.create(createUserDto));
  }

  @Get()
  async findAll(): Promise<PublicUser[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => toPublicUser(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PublicUser> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return toPublicUser(user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<PublicUser> {
    const user = await this.usersService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return toPublicUser(user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
