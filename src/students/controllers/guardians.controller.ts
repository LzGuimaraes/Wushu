import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { StudentProfilesService } from '../services/student-profiles.service';
import { GuardiansService } from '../services/guardians.service';
import { CreateGuardianDto } from '../dto/create-guardian.dto';
import { UpdateGuardianDto } from '../dto/update-guardian.dto';

@Controller('guardians')
export class GuardiansController {
  constructor(
    private readonly guardiansService: GuardiansService,
    private readonly studentProfilesService: StudentProfilesService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMy(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.studentProfilesService.findByUserId(user.userId);
    return this.guardiansService.findAllByStudentProfileId(profile.id);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async createMy(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGuardianDto,
  ) {
    const profile = await this.studentProfilesService.findByUserId(user.userId);
    return this.guardiansService.create({
      ...dto,
      studentProfileId: profile.id,
    });
  }

  @Patch('me/:id')
  @UseGuards(JwtAuthGuard)
  async updateMy(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateGuardianDto,
  ) {
    const profile = await this.studentProfilesService.findByUserId(user.userId);
    const guardian = await this.guardiansService.findOne(id);
    if (guardian.studentProfileId !== profile.id) {
      throw new ForbiddenException('Você só pode editar seus próprios responsáveis');
    }
    return this.guardiansService.update(id, dto);
  }

  @Delete('me/:id')
  @UseGuards(JwtAuthGuard)
  async removeMy(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const profile = await this.studentProfilesService.findByUserId(user.userId);
    const guardian = await this.guardiansService.findOne(id);
    if (guardian.studentProfileId !== profile.id) {
      throw new ForbiddenException('Você só pode remover seus próprios responsáveis');
    }
    await this.guardiansService.remove(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateGuardianDto) {
    return this.guardiansService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('studentProfileId') studentProfileId: string) {
    return this.guardiansService.findAllByStudentProfileId(studentProfileId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateGuardianDto) {
    return this.guardiansService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.guardiansService.remove(id);
  }
}
