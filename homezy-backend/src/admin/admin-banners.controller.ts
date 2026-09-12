import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BannersService } from '@/banners/banners.service';
import { Roles } from '@/common/decorators/roles.decorator';

@Roles('admin')
@Controller('admin/banners')
export class AdminBannersController {
  constructor(private bannersService: BannersService) {}

  @Get()
  findAll() {
    return this.bannersService.findAllForAdmin();
  }

  @Post()
  create(@Body() body: any) {
    return this.bannersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.bannersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
