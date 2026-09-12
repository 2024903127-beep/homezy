import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  findAllActive() {
    return this.prisma.banner.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } });
  }

  // ── Admin ──────────────────────────────────────────────────
  findAllForAdmin() {
    return this.prisma.banner.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  create(data: { imageUrl: string; linkType?: string; linkValue?: string; displayOrder?: number }) {
    return this.prisma.banner.create({ data });
  }

  update(id: string, data: Partial<{ imageUrl: string; linkType: string; linkValue: string; displayOrder: number; isActive: boolean }>) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.banner.update({ where: { id }, data: { isActive: false } });
  }
}
