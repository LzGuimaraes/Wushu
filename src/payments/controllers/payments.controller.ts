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
import { PaymentsService } from '../services/payments.service';
import { StudentProfilesService } from '../../students/services/student-profiles.service';
import { EnrollmentsService } from '../../enrollments/services/enrollments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly studentProfilesService: StudentProfilesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.studentProfilesService.findByUserId(user.userId);
    const enrollments = await this.enrollmentsService.findByStudentId(profile.id);
    return this.paymentsService.findByEnrollmentIds(
      enrollments.map((enrollment) => enrollment.id),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('enrollment/:enrollmentId')
  @UseGuards(JwtAuthGuard)
  findByEnrollmentId(@Param('enrollmentId') enrollmentId: string) {
    return this.paymentsService.findByEnrollmentId(enrollmentId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.confirmAs(user, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
