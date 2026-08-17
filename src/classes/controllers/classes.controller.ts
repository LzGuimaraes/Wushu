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
import { ClassesService } from '../services/classes.service';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { EnrollStudentDto } from '../dto/enroll-student.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClassDto) {
    return this.classesService.create(user, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classesService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.classesService.remove(user, id);
  }

  @Post(':id/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  addStudent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.classesService.addStudent(user, id, dto.enrollmentId);
  }

  @Get(':id/students')
  @UseGuards(JwtAuthGuard)
  findStudents(@Param('id') id: string) {
    return this.classesService.findStudentsByClassId(id);
  }

  @Delete(':id/students/:enrollmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  removeStudent(
    @Param('id') id: string,
    @Param('enrollmentId') enrollmentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classesService.removeStudent(user, id, enrollmentId);
  }
}
