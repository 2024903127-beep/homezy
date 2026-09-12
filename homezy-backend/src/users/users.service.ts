import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertAddressDto } from './dto/upsert-address.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.email && user.name) {
      const anyUserWithEmail = await this.prisma.user.findFirst({
        where: { email: { not: null }, name: user.name },
        orderBy: { updatedAt: 'desc' },
      });
      if (anyUserWithEmail?.email) {
        return this.prisma.user.update({
          where: { id: userId },
          data: { email: anyUserWithEmail.email },
        });
      }
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id: userId }, data: dto });
  }

  getAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async upsertAddress(userId: string, dto: UpsertAddressDto, addressId?: string) {
    if (dto.isDefault) {
      // Only one default address per customer.
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    if (addressId) {
      const existing = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
      if (!existing) throw new NotFoundException('Address not found');
      return this.prisma.address.update({ where: { id: addressId }, data: dto });
    }

    return this.prisma.address.create({ data: { ...dto, userId } });
  }

  async deleteAddress(userId: string, addressId: string) {
    const existing = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!existing) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id: addressId } });
  }

  // ── Admin ──────────────────────────────────────────────────
  listForAdmin(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  setActive(userId: string, isActive: boolean) {
    return this.prisma.user.update({ where: { id: userId }, data: { isActive } });
  }

  // ── Notifications (derived from booking status history) ────────────────────
  async getNotifications(userId: string) {
    const events = await this.prisma.bookingStatusEvent.findMany({
      where: { booking: { customerId: userId } },
      include: { booking: { include: { service: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const STATUS_COPY: Record<string, { title: string; type: string }> = {
      PENDING:           { title: 'Booking Placed', type: 'booking' },
      CONFIRMED:         { title: 'Booking Confirmed', type: 'booking' },
      PROVIDER_ASSIGNED: { title: 'Professional Assigned', type: 'booking' },
      PROVIDER_ARRIVED:  { title: 'Professional Has Arrived', type: 'booking' },
      IN_PROGRESS:       { title: 'Service In Progress', type: 'booking' },
      COMPLETED:         { title: 'Service Completed ✅', type: 'booking' },
      CANCELLED:         { title: 'Booking Cancelled', type: 'booking' },
    };

    return events.map((e) => {
      const meta = STATUS_COPY[e.status] ?? { title: e.status, type: 'system' };
      const svcName = (e.booking as any)?.service?.name || 'Homezy Service';
      return {
        id: e.id,
        type: meta.type,
        title: meta.title,
        body: `${svcName} — Booking #${e.bookingId.slice(-6).toUpperCase()}`,
        isRead: true, // mark all as read for now (no read-state table yet)
        createdAt: e.createdAt.toISOString(),
      };
    });
  }
}

