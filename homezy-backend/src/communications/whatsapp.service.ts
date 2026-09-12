import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private accessToken: string | undefined;
  private phoneNumberId: string | undefined;

  constructor(private config: ConfigService) {
    this.accessToken = this.config.get<string>('WHATSAPP_ACCESS_TOKEN');
    this.phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');

    if (this.accessToken && this.phoneNumberId) {
      this.logger.log('Meta WhatsApp Cloud API integration initialized');
    } else {
      this.logger.warn('WhatsApp Cloud API keys not configured ?" messages will be logged to console in dev mode');
    }
  }

  async sendTextMessage(toPhone: string, text: string): Promise<boolean> {
    const cleanPhone = toPhone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('0')) {
      formattedPhone = `91${formattedPhone.slice(1)}`;
    }

    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.log(`[DEV WHATSAPP] To: +${formattedPhone} | Text: ${text}`);
      return true;
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { preview_url: false, body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`WhatsApp message sent successfully to +${formattedPhone}`);
      return true;
    } catch (error: any) {
      this.logger.error(`WhatsApp sending failed: ${error?.response?.data?.error?.message || error.message}`);
      return false;
    }
  }

  async sendOtpWhatsApp(phone: string, otp: string): Promise<boolean> {
    const message = `*Homezy Verification Code*\n\nYour OTP is *${otp}*.\n\nUse this code to log into your Homezy account. Valid for 10 minutes.\n\n_Please do not share this code with anyone._`;
    return this.sendTextMessage(phone, message);
  }

  async sendBookingAlert(phone: string, serviceName: string, scheduledTime: string, bookingId: string): Promise<boolean> {
    const message = `*Homezy Booking Confirmed!* ?\n\nService: *${serviceName}*\nScheduled For: *${scheduledTime}*\nBooking ID: #${bookingId.slice(-6).toUpperCase()}\n\nTrack status live in the Homezy app.`;
    return this.sendTextMessage(phone, message);
  }
}
