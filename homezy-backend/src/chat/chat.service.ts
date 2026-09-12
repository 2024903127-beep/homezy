import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessages(bookingId: string) {
    try {
      const msgs = await (this.prisma as any).chatMessage.findMany({
        where: { bookingId },
        orderBy: { createdAt: 'asc' },
      });
      return msgs;
    } catch {
      return [];
    }
  }

  async sendMessage(bookingId: string, senderId: string, senderRole: string, message: string) {
    if (!message || !message.trim()) {
      throw new BadRequestException('Message cannot be empty');
    }
    return (this.prisma as any).chatMessage.create({
      data: {
        bookingId,
        senderId,
        senderRole,
        message: message.trim(),
      },
    });
  }
}