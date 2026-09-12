import { Injectable, UnauthorizedException, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/database/prisma.service';
import { BrevoService } from '@/communications/brevo.service';
import { WhatsAppService } from '@/communications/whatsapp.service';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @Optional() private brevoService?: BrevoService,
    @Optional() private whatsAppService?: WhatsAppService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000)
      .toString()
      .slice(0, OTP_LENGTH);
  }

  /**
   * Issues an OTP, persists hash to PostgreSQL, and dispatches via MSG91 SMS, Meta WhatsApp, and Brevo Email.
   */
  async issueOtp(phone: string, target: { userId?: string; providerId?: string; email?: string } = {}): Promise<void> {
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { phone, codeHash, expiresAt, userId: target.userId, providerId: target.providerId },
    });

    this.logger.log(`[AUTH OTP] Code for ${phone} is: ${code} (valid for ${OTP_TTL_MINUTES} mins)`);

    // 1. WhatsApp Dispatch (Meta Cloud API)
    if (this.whatsAppService) {
      this.whatsAppService.sendOtpWhatsApp(phone, code).catch((err) => {
        this.logger.warn(`WhatsApp OTP dispatch error: ${err.message}`);
      });
    }

    // 2. Email Dispatch (Brevo) if user/target has email
    let recipientEmail = target.email;
    if (!recipientEmail && target.userId) {
      const user = await this.prisma.user.findUnique({ where: { id: target.userId }, select: { email: true } });
      recipientEmail = user?.email || undefined;
    }
    if (!recipientEmail && target.providerId) {
      const provider = await this.prisma.provider.findUnique({ where: { id: target.providerId }, select: { email: true } });
      recipientEmail = provider?.email || undefined;
    }

    if (recipientEmail && this.brevoService) {
      this.brevoService.sendOtpEmail(recipientEmail, code).catch((err) => {
        this.logger.warn(`Brevo OTP email dispatch error: ${err.message}`);
      });
    }

    // 3. SMS Gateway Dispatch (MSG91)
    const msg91AuthKey = this.config.get<string>('MSG91_AUTH_KEY');
    const msg91TemplateId = this.config.get<string>('MSG91_TEMPLATE_ID');

    if (msg91AuthKey && msg91TemplateId) {
      try {
        const formattedPhone = phone.startsWith('91') ? phone : `91${phone.replace(/\D/g, '')}`;
        const url = `https://control.msg91.com/api/v5/otp?template_id=${msg91TemplateId}&mobile=${formattedPhone}&authkey=${msg91AuthKey}&otp=${code}`;
        const res = await fetch(url, { method: 'POST' });
        const result = await res.json();
        this.logger.log(`MSG91 OTP dispatched to ${formattedPhone}: ${JSON.stringify(result)}`);
      } catch (err: any) {
        this.logger.error(`MSG91 dispatch failed for ${phone}: ${err.message}`);
      }
    }
  }

  async verifyOtp(phone: string, code: string): Promise<void> {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanCode = code.trim();

    // Try finding the active OTP matching exact phone or sanitized phone
    const candidate = await this.prisma.otpCode.findFirst({
      where: {
        OR: [
          { phone },
          { phone: cleanPhone },
          { phone: `+91${cleanPhone.slice(-10)}` },
          { phone: cleanPhone.slice(-10) },
        ],
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!candidate) {
      throw new UnauthorizedException('OTP expired or not found. Please request a new verification code.');
    }

    const isValid = await bcrypt.compare(cleanCode, candidate.codeHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP entered. Please check the code sent to your email and try again.');
    }

    await this.prisma.otpCode.update({
      where: { id: candidate.id },
      data: { consumedAt: new Date() },
    });
  }
}
