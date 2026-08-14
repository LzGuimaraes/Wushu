import { Controller, Get } from '@nestjs/common';

import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /** Dados agregados para a landing page (público). */
  @Get('landing')
  async landing() {
    const [classes, instructors] = await Promise.all([
      this.publicService.listClasses(),
      this.publicService.listInstructors(),
    ]);
    return { classes, instructors };
  }

  @Get('classes')
  listClasses() {
    return this.publicService.listClasses();
  }

  @Get('instructors')
  listInstructors() {
    return this.publicService.listInstructors();
  }
}
