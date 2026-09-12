import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { ProviderJobsController } from './provider-jobs.controller';
import { BookingsService } from './bookings.service';
import { CommunicationsModule } from '@/communications/communications.module';

@Module({
  imports: [CommunicationsModule],
  controllers: [BookingsController, ProviderJobsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
