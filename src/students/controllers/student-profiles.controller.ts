import {
  Body,
  Controller,
  Delete,
  Get,
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
import { StudentProfilesService } from '../services/student-profiles.service';
import { CreateStudentProfileDto } from '../dto/create-student-profile.dto';
import { CompleteStudentProfileDto } from '../dto/complete-student-profile.dto';
import { UpdateStudentProfileDto } from '../dto/update-student-profile.dto';

@Controller('students')
export class StudentProfilesController {
  constructor(
    private readonly studentProfilesService: StudentProfilesService,
  ) {}

  @Post('me')
  @UseGuards(JwtAuthGuard)
  completeProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CompleteStudentProfileDto,
  ) {
    return this.studentProfilesService.create({ ...dto, userId: user.userId });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.studentProfilesService.findByUserId(user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateStudentProfileDto) {
    return this.studentProfilesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.studentProfilesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.studentProfilesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateStudentProfileDto) {
    return this.studentProfilesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.studentProfilesService.remove(id);
  }
}
