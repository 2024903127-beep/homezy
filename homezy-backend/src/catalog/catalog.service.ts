import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  findByCategory(categoryId: string) {
    return this.prisma.service.findMany({ where: { categoryId, isActive: true } });
  }

  search(query: string) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 30,
    });
  }

  findById(id: string) {
    return this.prisma.service.findUniqueOrThrow({ where: { id } });
  }

  // ── Admin ──────────────────────────────────────────────────
  findAllForAdmin() {
    return this.prisma.service.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  }

  create(data: {
    categoryId: string;
    name: string;
    description: string;
    price: number;
    estimatedDurationMinutes: number;
    imageUrl?: string;
    inclusions?: string[];
    exclusions?: string[];
  }) {
    return this.prisma.service.create({ data });
  }

  update(id: string, data: Partial<Parameters<CatalogService['create']>[0]> & { isActive?: boolean }) {
    return this.prisma.service.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.service.update({ where: { id }, data: { isActive: false } });
  }
}
