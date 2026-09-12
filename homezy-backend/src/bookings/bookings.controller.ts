import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/auth/jwt-payload.type';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SubmitRatingDto } from './dto/submit-rating.dto';

// Matches homezy-consumer/src/services/bookingService.ts
@Roles('customer')
@Controller()
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post('booking')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.sub, dto);
  }

  @Get('booking/:id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookingsService.findByIdForCustomer(user.sub, id);
  }

  @Patch('booking/:id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.update(user.sub, id, dto);
  }

  @Get('history')
  history(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.getHistoryForCustomer(user.sub);
  }

  @Post('rating')
  rate(@CurrentUser() user: JwtPayload, @Body() dto: SubmitRatingDto) {
    return this.bookingsService.submitRating(user.sub, dto);
  }
}
