import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async validate(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) return null;
    if (coupon.validUntil && coupon.validUntil < new Date()) return null;
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) return null;
    return coupon;
  }

  // ── Admin ──────────────────────────────────────────────────
  findAllForAdmin() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: {
    code: string;
    description: string;
    discountPercent?: number;
    discountFlat?: number;
    validFrom?: string;
    validUntil?: string;
    usageLimit?: number;
  }) {
    return this.prisma.coupon.create({
      data: {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      },
    });
  }

  update(id: string, data: Partial<{ description: string; isActive: boolean; usageLimit: number }>) {
    return this.prisma.coupon.update({ where: { id }, data });
  }
}
