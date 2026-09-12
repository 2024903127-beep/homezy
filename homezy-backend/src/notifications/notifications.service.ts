import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import axios from 'axios';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async registerDeviceToken(params: {
    token: string;
    userId?: string;
    providerId?: string;
    platform?: string;
  }) {
    return this.prisma.deviceToken.upsert({
      where: { token: params.token },
      update: {
        userId: params.userId,
        providerId: params.providerId,
        platform: params.platform || 'expo',
      },
      create: {
        token: params.token,
        userId: params.userId,
        providerId: params.providerId,
        platform: params.platform || 'expo',
      },
    });
  }

  async sendToUser(userId: string, payload: PushNotificationPayload) {
    this.logger.log(`[PUSH -> USER ${userId}] ${payload.title} - ${payload.body}`);

    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (tokens.length === 0) return;

    await this.dispatchExpoPush(
      tokens.map((t) => t.token),
      payload,
    );
  }

  async sendToProvider(providerId: string, payload: PushNotificationPayload) {
    this.logger.log(`[PUSH -> PROVIDER ${providerId}] ${payload.title} - ${payload.body}`);

    const tokens = await this.prisma.deviceToken.findMany({
      where: { providerId },
      select: { token: true },
    });

    if (tokens.length === 0) return;

    await this.dispatchExpoPush(
      tokens.map((t) => t.token),
      payload,
    );
  }

  private async dispatchExpoPush(tokens: string[], payload: PushNotificationPayload) {
    const messages = tokens
      .filter((token) => token.startsWith('ExponentPushToken') || token.startsWith('ExpoPushToken'))
      .map((to) => ({
        to,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        priority: 'high',
      }));

    if (messages.length === 0) return;

    try {
      await axios.post('https://exp.host/--/api/v2/push/send', messages, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      this.logger.log(`Dispatched ${messages.length} Expo push notifications`);
    } catch (error: any) {
      this.logger.error(`Expo push dispatch failed: ${error?.response?.data || error.message}`);
    }
  }
}
