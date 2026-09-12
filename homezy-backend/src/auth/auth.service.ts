import { Injectable, UnauthorizedException, NotFoundException, Optional, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/database/prisma.service';
import { OtpService } from './otp.service';
import { AuthRole } from './jwt-payload.type';
import { BrevoService } from '@/communications/brevo.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private otp: OtpService,
    @Optional() private brevo?: BrevoService,
  ) {}

  private signToken(sub: string, role: AuthRole, adminRole?: string) {
    return this.jwt.sign({ sub, role, adminRole });
  }

  // ── Customer ─────────────────────────────────────────────────────────────
  async requestCustomerOtp(phone: string, email?: string) {
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (user && email && !user.email) {
      user = await this.prisma.user.update({ where: { id: user.id }, data: { email } });
    }
    const targetEmail = email || user?.email || undefined;
    await this.otp.issueOtp(phone, { userId: user?.id, email: targetEmail });
    return { sent: true };
  }

  async verifyCustomerOtp(phone: string, code: string) {
    await this.otp.verifyOtp(phone, code);

    let user = await this.prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          name: `Customer (${phone.slice(-4)})`,
        },
      });
    }

    if (!user.email && user.name) {
      const anyUserWithEmail = await this.prisma.user.findFirst({
        where: { email: { not: null }, name: user.name },
        orderBy: { updatedAt: 'desc' },
      });
      if (anyUserWithEmail?.email) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { email: anyUserWithEmail.email },
        });
      }
    }

    return {
      token: this.signToken(user.id, 'customer'),
      user,
      isNewUser,
    };
  }

  // ── Provider ─────────────────────────────────────────────────────────────
  async requestProviderOtp(phone: string, email?: string) {
    let provider = await this.prisma.provider.findUnique({ where: { phone } });
    if (provider && email && !provider.email) {
      provider = await this.prisma.provider.update({ where: { id: provider.id }, data: { email } });
    }
    const targetEmail = email || provider?.email || undefined;
    await this.otp.issueOtp(phone, { providerId: provider?.id, email: targetEmail });
    return { sent: true };
  }

  async verifyProviderOtp(phone: string, code: string) {
    await this.otp.verifyOtp(phone, code);

    let provider = await this.prisma.provider.findUnique({
      where: { phone },
      include: { categories: true },
    });
    const isNewProvider = !provider;

    const allCategories = await this.prisma.category.findMany({ select: { id: true } });

    if (!provider) {
      // Automatically register new partner as verified, on-duty, connected to all categories
      provider = await this.prisma.provider.create({
        data: {
          phone,
          name: `Partner (${phone.slice(-4)})`,
          verificationStatus: 'VERIFIED',
          isOnDuty: true,
          isActive: true,
          categories: { connect: allCategories.map((c) => ({ id: c.id })) },
        },
        include: { categories: true },
      });
    } else {
      // Ensure existing partner is active, verified, and has categories connected
      provider = await this.prisma.provider.update({
        where: { id: provider.id },
        data: {
          verificationStatus: 'VERIFIED',
          isOnDuty: true,
          isActive: true,
          categories: { connect: allCategories.map((c) => ({ id: c.id })) },
        },
        include: { categories: true },
      });
    }

    return {
      token: this.signToken(provider.id, 'provider'),
      provider,
      isNewProvider,
    };
  }

  async providerPasswordLogin(email: string, password: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { email },
      include: { categories: true },
    });
    if (!provider?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await bcrypt.compare(password, provider.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      token: this.signToken(provider.id, 'provider'),
      provider,
      isNewProvider: false,
    };
  }

  // ── Admin ────────────────────────────────────────────────────────────────
  async adminLogin(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

    return {
      token: this.signToken(admin.id, 'admin', admin.role),
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    };
  }

  async adminForgotPassword(email: string): Promise<{ sent: boolean }> {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive) {
      // Return success even if not found — prevents email enumeration attacks
      return { sent: true };
    }

    // Generate 12-char temporary password
    const tempPassword = Math.random().toString(36).slice(-6).toUpperCase() +
      Math.random().toString(36).slice(-6).toUpperCase();
    const hash = await bcrypt.hash(tempPassword, 12);

    await this.prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: hash } });

    if (this.brevo) {
      await this.brevo.sendEmail({
        to: email,
        subject: '🔑 Homezy Admin — Temporary Password',
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
            <h2 style="color:#0F172A;">Password Reset</h2>
            <p>Hello <strong>${admin.name}</strong>,</p>
            <p>A password reset was requested for your Homezy Admin account. Your temporary password is:</p>
            <div style="background:#F0FDF4;border:2px dashed #10B981;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
              <code style="font-size:24px;font-weight:900;letter-spacing:4px;color:#0F172A;">${tempPassword}</code>
            </div>
            <p style="color:#EF4444;font-weight:600;">Please change this password immediately after logging in.</p>
            <p style="color:#64748B;font-size:12px;">If you did not request a password reset, contact your super admin immediately.</p>
          </div>
        `,
      });
      this.logger.log(`Admin password reset email sent to ${email}`);
    } else {
      this.logger.log(`[DEV] Admin temp password for ${email}: ${tempPassword}`);
    }

    return { sent: true };
  }
}

