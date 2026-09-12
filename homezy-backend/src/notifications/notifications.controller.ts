import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('device-token')
  async registerToken(
    @CurrentUser() user: any,
    @Body('token') token: string,
    @Body('platform') platform?: string,
  ) {
    if (!token) throw new BadRequestException('token is required');

    const isProvider = user?.role === 'PROVIDER' || user?.type === 'provider';
    return this.notificationsService.registerDeviceToken({
      token,
      userId: !isProvider ? user?.id || user?.sub : undefined,
      providerId: isProvider ? user?.id || user?.sub : undefined,
      platform,
    });
  }
}
