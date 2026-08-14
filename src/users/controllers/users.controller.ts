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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateMeDto } from '../dto/update-me.dto';
import { RejectUserDto } from '../dto/reject-user.dto';
import { ApproveBatchDto } from '../dto/approve-batch.dto';
import { PublicUser, toPublicUser } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ---- Rotas do próprio usuário ----

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateMeDto,
  ): Promise<PublicUser> {
    return toPublicUser(await this.usersService.updateMe(user.userId, dto));
  }

  // ---- Rotas administrativas ----

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findPending() {
    return this.usersService.findPendingRegistrations();
  }

  @Patch('approve-batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveBatch(@Body() dto: ApproveBatchDto) {
    return this.usersService.approveBatch(dto.ids);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<PublicUser> {
    return toPublicUser(await this.usersService.create(createUserDto));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<PublicUser[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => toPublicUser(user));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string): Promise<PublicUser> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return toPublicUser(user);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string): Promise<PublicUser> {
    return toPublicUser(await this.usersService.approve(id));
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectUserDto,
  ): Promise<PublicUser> {
    return toPublicUser(await this.usersService.reject(id, dto.reason));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
