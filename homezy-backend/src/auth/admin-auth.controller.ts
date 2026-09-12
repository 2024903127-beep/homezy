import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '@/common/decorators/public.decorator';
import { EmailLoginDto } from './dto/email-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

// Consumed by the admin panel's login page.
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 600000 } })
  @Public()
  @Post('login')
  login(@Body() dto: EmailLoginDto) {
    return this.authService.adminLogin(dto.email, dto.password);
  }

  @Throttle({ default: { limit: 3, ttl: 600000 } })
  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.adminForgotPassword(dto.email);
  }
}
