import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { BookingsService } from '@/bookings/bookings.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { BookingStatus } from '@prisma/client';

@Roles('admin')
@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  findAll(@Query('status') status?: BookingStatus, @Query('search') search?: string) {
    return this.bookingsService.findAllForAdmin({ status, search });
  }

  @Patch(':id/reassign')
  reassign(@Param('id') id: string, @Body('providerId') providerId: string) {
    return this.bookingsService.reassignProvider(id, providerId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Body('note') note?: string,
  ) {
    return this.bookingsService.adminUpdateStatus(id, status, note);
  }
}

