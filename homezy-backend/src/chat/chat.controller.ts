import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/auth/jwt-payload.type';
import { Roles } from '@/common/decorators/roles.decorator';

@Roles('customer', 'provider', 'admin')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':bookingId')
  getMessages(@Param('bookingId') bookingId: string) {
    return this.chatService.getMessages(bookingId);
  }

  @Post(':bookingId')
  sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('bookingId') bookingId: string,
    @Body('message') message: string,
    @Body('senderRole') role?: string,
  ) {
    const senderRole = role || (user.role === 'provider' ? 'PARTNER' : 'CUSTOMER');
    return this.chatService.sendMessage(bookingId, user.sub, senderRole, message);
  }
}