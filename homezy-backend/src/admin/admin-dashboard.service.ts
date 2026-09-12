import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [totalUsers, totalProviders, activeProviders, pendingVerifications, ongoingBookings, completedBookings, cancelledBookings] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.provider.count(),
        this.prisma.provider.count({ where: { isOnDuty: true } }),
        this.prisma.provider.count({ where: { verificationStatus: 'PENDING' } }),
        this.prisma.booking.count({
          where: { status: { in: ['PENDING', 'CONFIRMED', 'PROVIDER_ASSIGNED', 'PROVIDER_ARRIVED', 'IN_PROGRESS'] } },
        }),
        this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
        this.prisma.booking.count({ where: { status: 'CANCELLED' } }),
      ]);

    const revenueAgg = await this.prisma.booking.aggregate({
      where: { status: 'COMPLETED', paymentStatus: 'PAID' },
      _sum: { price: true },
    });

    return {
      totalUsers,
      totalProviders,
      activeProviders,
      pendingVerifications,
      ongoingBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: Number(revenueAgg._sum.price ?? 0),
    };
  }

  // Bookings-per-day for the last N days — powers a simple line chart on
  // the admin dashboard (Recharts on the frontend).
  async getBookingsTrend(days = 14) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const bookings = await this.prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, status: true, price: true },
    });

    const byDay = new Map<string, { date: string; bookings: number; revenue: number }>();
    for (const b of bookings) {
      const key = b.createdAt.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { date: key, bookings: 0, revenue: 0 };
      entry.bookings += 1;
      if (b.status === 'COMPLETED') entry.revenue += Number(b.price);
      byDay.set(key, entry);
    }

    return Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCategoryBreakdown() {
    const services = await this.prisma.service.findMany({
      include: { category: true, _count: { select: { bookings: true } } },
    });

    const byCategory = new Map<string, { category: string; bookings: number }>();
    for (const s of services) {
      const entry = byCategory.get(s.category.name) ?? { category: s.category.name, bookings: 0 };
      entry.bookings += s._count.bookings;
      byCategory.set(s.category.name, entry);
    }
    return Array.from(byCategory.values());
  }
}
