import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';

@Module({
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
