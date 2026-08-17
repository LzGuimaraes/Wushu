import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminPdfService } from './admin-pdf.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminPdfService],
})
export class AdminModule {}
