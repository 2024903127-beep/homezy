import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '@/common/decorators/public.decorator';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

// Matches homezy-consumer/src/services/authService.ts
@Controller('auth')
export class CustomerAuthController {
  constructor(private authService: AuthService) {}

  // 5 OTP requests per 10 minutes per IP — prevents SMS/OTP spam
  @Throttle({ default: { limit: 5, ttl: 600000 } })
  @Public()
  @Post('request-otp')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestCustomerOtp(dto.phone, dto.email);
  }

  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyCustomerOtp(dto.phone, dto.otp);
  }
}
