import { Module } from '@nestjs/common';
import { UsersModule } from '@/users/users.module';
import { ProvidersModule } from '@/providers/providers.module';
import { BookingsModule } from '@/bookings/bookings.module';
import { CategoriesModule } from '@/categories/categories.module';
import { CatalogModule } from '@/catalog/catalog.module';
import { CouponsModule } from '@/coupons/coupons.module';
import { BannersModule } from '@/banners/banners.module';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminProvidersController } from './admin-providers.controller';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminServicesController } from './admin-services.controller';
import { AdminCouponsController } from './admin-coupons.controller';
import { AdminBannersController } from './admin-banners.controller';

@Module({
  imports: [UsersModule, ProvidersModule, BookingsModule, CategoriesModule, CatalogModule, CouponsModule, BannersModule],
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    AdminProvidersController,
    AdminBookingsController,
    AdminCategoriesController,
    AdminServicesController,
    AdminCouponsController,
    AdminBannersController,
  ],
  providers: [AdminDashboardService],
})
export class AdminModule {}
