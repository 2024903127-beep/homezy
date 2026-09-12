import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAllActive() {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } });
  }

  // ── Admin ──────────────────────────────────────────────────
  findAllForAdmin() {
    return this.prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  create(data: { name: string; iconUrl?: string; displayOrder?: number }) {
    return this.prisma.category.create({ data });
  }

  update(id: string, data: { name?: string; iconUrl?: string; displayOrder?: number; isActive?: boolean }) {
    return this.prisma.category.update({ where: { id }, data });
  }

  remove(id: string) {
    // Soft-delete via isActive rather than a hard delete, so existing
    // bookings/services referencing this category stay intact.
    return this.prisma.category.update({ where: { id }, data: { isActive: false } });
  }
}
