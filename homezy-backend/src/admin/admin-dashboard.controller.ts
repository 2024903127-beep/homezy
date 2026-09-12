import { Controller, Get, Query } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { Roles } from '@/common/decorators/roles.decorator';

@Roles('admin')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private dashboardService: AdminDashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboardService.getSummary();
  }

  @Get('bookings-trend')
  bookingsTrend(@Query('days') days?: string) {
    return this.dashboardService.getBookingsTrend(days ? Number(days) : undefined);
  }

  @Get('category-breakdown')
  categoryBreakdown() {
    return this.dashboardService.getCategoryBreakdown();
  }
}
