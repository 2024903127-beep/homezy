import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';

// No public controller of its own yet — consumed by BookingsService for
// discount calculation and by the admin coupons controller. Exported so
// both can inject it.
@Module({
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
