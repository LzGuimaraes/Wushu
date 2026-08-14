import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { BeltHistoryService } from '../services/belt-history.service';
import { CreateBeltHistoryDto } from '../dto/create-belt-history.dto';

@Controller('belt-history')
export class BeltHistoryController {
  constructor(private readonly beltHistoryService: BeltHistoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateBeltHistoryDto) {
    return this.beltHistoryService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('studentProfileId') studentProfileId: string) {
    return this.beltHistoryService.findAllByStudentProfileId(studentProfileId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.beltHistoryService.remove(id);
  }
}
