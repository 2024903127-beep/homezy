import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpayClient: Razorpay | null = null;
  private keySecret: string | undefined;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const keyId = this.config.get<string>('RAZORPAY_KEY_ID');
    this.keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET');

    if (keyId && this.keySecret) {
      this.razorpayClient = new Razorpay({
        key_id: keyId,
        key_secret: this.keySecret,
      });
      this.logger.log('Razorpay payment gateway initialized');
    } else {
      this.logger.warn('Razorpay keys not configured ?" operating in test/mock mode');
    }
  }

  async initiate(customerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, customerId } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.paymentMode === 'COD') {
      await this.prisma.payment.upsert({
        where: { bookingId },
        update: {},
        create: { bookingId, amount: booking.price, gateway: 'cod', status: 'PENDING' },
      });
      return { gateway: 'cod' };
    }

    let orderId = `order_dev_${bookingId}`;

    if (this.razorpayClient) {
      try {
        const amountInPaise = Math.round(Number(booking.price) * 100);
        const order = await this.razorpayClient.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${bookingId.slice(-8)}`,
          notes: {
            bookingId,
            customerId,
          },
        });
        orderId = order.id;
        this.logger.log(`Created Razorpay order: ${orderId} for booking ${bookingId}`);
      } catch (err: any) {
        this.logger.error(`Razorpay order creation failed: ${err.message}`);
      }
    }

    await this.prisma.payment.upsert({
      where: { bookingId },
      update: { gatewayOrderId: orderId },
      create: { bookingId, amount: booking.price, gateway: 'razorpay', gatewayOrderId: orderId, status: 'PENDING' },
    });

    return {
      orderId,
      gateway: 'razorpay',
      amount: Number(booking.price),
      currency: 'INR',
      keyId: this.config.get<string>('RAZORPAY_KEY_ID', 'rzp_test_placeholder'),
    };
  }

  async handleWebhook(payload: any, signature?: string) {
    const webhookSecret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET');

    // Verify webhook signature if secret provided
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    const orderId = payload?.payload?.payment?.entity?.order_id;
    if (!orderId) return;

    const payment = await this.prisma.payment.findFirst({ where: { gatewayOrderId: orderId } });
    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        gatewayPaymentId: payload?.payload?.payment?.entity?.id,
        rawWebhookPayload: payload,
      },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: 'PAID' },
    });

    this.logger.log(`Payment confirmed for booking ${payment.bookingId} via Razorpay order ${orderId}`);
  }
}
