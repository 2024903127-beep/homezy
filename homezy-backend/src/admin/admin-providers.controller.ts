import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ProvidersService } from '@/providers/providers.service';
import { Roles } from '@/common/decorators/roles.decorator';

@Roles('admin')
@Controller('admin/providers')
export class AdminProvidersController {
  constructor(private providersService: ProvidersService) {}

  @Get()
  findAll(@Query('verificationStatus') verificationStatus?: string, @Query('search') search?: string) {
    return this.providersService.listForAdmin({ verificationStatus, search });
  }

  @Patch(':id/verify')
  verify(@Param('id') id: string) {
    return this.providersService.setVerificationStatus(id, 'VERIFIED');
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.providersService.setVerificationStatus(id, 'REJECTED', reason);
  }

  @Patch(':id/categories')
  assignCategories(@Param('id') id: string, @Body('categoryIds') categoryIds: string[]) {
    return this.providersService.assignCategories(id, categoryIds);
  }

  @Patch(':id/coverage')
  setCoverage(@Param('id') id: string, @Body('pincodes') pincodes: string[]) {
    return this.providersService.setCoverageAreas(id, pincodes);
  }
}
