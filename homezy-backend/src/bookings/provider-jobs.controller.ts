import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/auth/jwt-payload.type';

// Matches homezy-provider/src/services/jobService.ts
@Roles('provider')
@Controller('provider')
export class ProviderJobsController {
  constructor(private bookingsService: BookingsService) {}

  @Get('jobs/incoming')
  incoming(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findIncomingForProvider(user.sub);
  }

  @Get('jobs/active')
  active(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findActiveForProvider(user.sub);
  }

  @Get('jobs/history')
  history(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findHistoryForProvider(user.sub);
  }

  @Get('jobs/:id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookingsService.findByIdForProvider(user.sub, id);
  }

  @Post('accept')
  accept(
    @CurrentUser() user: JwtPayload,
    @Body('jobId') jobId?: string,
    @Body('bookingId') bookingId?: string,
  ) {
    return this.bookingsService.accept(user.sub, (jobId || bookingId)!);
  }

  @Post('reject')
  reject(
    @CurrentUser() user: JwtPayload,
    @Body('jobId') jobId?: string,
    @Body('bookingId') bookingId?: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.reject(user.sub, (jobId || bookingId)!, reason);
  }

  @Post('arrived')
  arrived(
    @CurrentUser() user: JwtPayload,
    @Body('jobId') jobId?: string,
    @Body('bookingId') bookingId?: string,
  ) {
    return this.bookingsService.advanceStatus(user.sub, (jobId || bookingId)!, 'PROVIDER_ARRIVED');
  }

  @Post('start')
  start(
    @CurrentUser() user: JwtPayload,
    @Body('jobId') jobId?: string,
    @Body('bookingId') bookingId?: string,
  ) {
    return this.bookingsService.advanceStatus(user.sub, (jobId || bookingId)!, 'IN_PROGRESS');
  }

  @Post('complete')
  complete(
    @CurrentUser() user: JwtPayload,
    @Body('jobId') jobId?: string,
    @Body('bookingId') bookingId?: string,
  ) {
    return this.bookingsService.advanceStatus(user.sub, (jobId || bookingId)!, 'COMPLETED');
  }
}
