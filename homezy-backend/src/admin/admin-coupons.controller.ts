import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CouponsService } from '@/coupons/coupons.service';
import { Roles } from '@/common/decorators/roles.decorator';

@Roles('admin')
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(private couponsService: CouponsService) {}

  @Get()
  findAll() {
    return this.couponsService.findAllForAdmin();
  }

  @Post()
  create(@Body() body: any) {
    return this.couponsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.couponsService.update(id, body);
  }
}
