import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { MedicalRecordsService } from '../services/medical-records.service';
import { UpsertMedicalRecordDto } from '../dto/upsert-medical-record.dto';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

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
