import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendConfirmationDto } from './dto/resend-confirmation.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = process.env.DOMAIN_WEB ?? process.env.FRONTEND_URL ?? process.env.APP_URL ?? 'http://localhost:3000';
    try {
      await this.authService.confirmEmail(token ?? '');
      return res.redirect(`${frontendUrl}/login?confirmed=1`);
    } catch (err: any) {
      const reason = encodeURIComponent(err?.message ?? 'invalid_token');
      return res.redirect(`${frontendUrl}/login?confirmed=0&reason=${reason}`);
    }
  }

  @Post('resend-confirmation')
  resendConfirmation(@Body() dto: ResendConfirmationDto) {
    return this.authService.resendConfirmation(dto.email);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Get('reset-password/validate')
  validateResetToken(@Query('token') token: string) {
    return this.authService.validateResetToken(token ?? '');
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
