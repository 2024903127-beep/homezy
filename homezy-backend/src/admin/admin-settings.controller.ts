import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator';
import { AdminSettingsService } from './admin-settings.service';

@Roles('admin')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getAll();
  }

  @Patch()
  updateSettings(@Body() patch: Record<string, unknown>) {
    return this.settingsService.update(patch);
  }
}
