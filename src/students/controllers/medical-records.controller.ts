import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { StudentProfilesService } from '../services/student-profiles.service';
import { MedicalRecordsService } from '../services/medical-records.service';
import { UpsertMedicalRecordDto } from '../dto/upsert-medical-record.dto';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly studentProfilesService: StudentProfilesService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMy(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.studentProfilesService.findByUserId(user.userId);
    return this.medicalRecordsService.findByStudentProfileId(profile.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async upsertMy(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertMedicalRecordDto,
  ) {
    const profile = await this.studentProfilesService.findByUserId(user.userId);
    return this.medicalRecordsService.upsert(profile.id, dto);
  }

  @Get(':studentProfileId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('studentProfileId') studentProfileId: string) {
    return this.medicalRecordsService.findByStudentProfileId(studentProfileId);
  }

  @Put(':studentProfileId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  upsert(
    @Param('studentProfileId') studentProfileId: string,
    @Body() dto: UpsertMedicalRecordDto,
  ) {
    return this.medicalRecordsService.upsert(studentProfileId, dto);
  }
}
