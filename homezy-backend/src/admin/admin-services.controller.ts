import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CatalogService } from '@/catalog/catalog.service';
import { Roles } from '@/common/decorators/roles.decorator';

@Roles('admin')
@Controller('admin/services')
export class AdminServicesController {
  constructor(private catalogService: CatalogService) {}

  @Get()
  findAll() {
    return this.catalogService.findAllForAdmin();
  }

  @Post()
  create(@Body() body: any) {
    return this.catalogService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.catalogService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
