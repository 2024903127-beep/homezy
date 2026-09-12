import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Public } from '@/common/decorators/public.decorator';

@Controller('services')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Public()
  @Get('search')
  search(@Query('q') query: string) {
    return this.catalogService.search(query ?? '');
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogService.findById(id);
  }

  @Public()
  @Get()
  findByCategory(@Query('categoryId') categoryId: string) {
    return this.catalogService.findByCategory(categoryId);
  }
}
