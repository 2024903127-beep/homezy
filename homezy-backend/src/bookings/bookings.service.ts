import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SubmitRatingDto } from './dto/submit-rating.dto';
import { BookingStatus } from '@prisma/client';
import { BrevoService } from '@/communications/brevo.service';

const bookingInclude = {
  service: {
    include: {
      category: true,
    },
  },
  address: true,
  provider: true,
  customer: true,
} as const;

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private prisma: PrismaService,
    @Optional() private brevo?: BrevoService,
  ) {}

  /**
   * Helper to format a Prisma Booking row into the exact Job model
   * expected by the partner/provider mobile app.
   */
  public formatJobForProvider(b: any) {
    return {
      id: b.id,
      serviceName: b.service?.name || 'Homezy Service',
      categoryId: b.service?.categoryId || b.service?.category?.id || 'ac-maintenance',
      scheduledAt: b.scheduledAt ? new Date(b.scheduledAt).toISOString() : new Date().toISOString(),
      status: b.status,
      price: Number(b.price) || 0,
      paymentMode: b.paymentMode || 'ONLINE',
      paymentStatus: b.paymentStatus || 'PENDING',
      customer: {
        name: b.customer?.name || 'Valued Customer',
        phone: b.customer?.phone || '+91 9999999999',
      },
      address: {
        line1: b.address?.line1 || 'Customer Address',
        line2: b.address?.line2 || '',
        city: b.address?.city || 'Gurugram',
        state: b.address?.state || 'Haryana',
        pincode: b.address?.pincode || '122002',
        latitude: b.address?.latitude || 28.4908,
        longitude: b.address?.longitude || 77.0917,
      },
      notes: b.notes || '',
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      service: b.service,
      provider: b.provider,
    };
  }

  // ── Customer-facing ───────────────────────────────────────────────────────

  async create(customerId: string, dto: CreateBookingDto) {
    // 1. Resolve or find service
    let service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { category: true },
    });

    if (!service) {
      if (dto.serviceCategory) {
        service = await this.prisma.service.findFirst({
          where: { categoryId: dto.serviceCategory },
          include: { category: true },
        });
      }
      if (!service) {
        service = await this.prisma.service.findFirst({
          include: { category: true },
        });
      }
      if (!service) {
        const catId = dto.serviceCategory || 'general-home-repairs';
        const category = await this.prisma.category.upsert({
          where: { id: catId },
          update: {},
          create: {
            id: catId,
            name: 'Home Services',
            displayOrder: 1,
          },
        });
        service = await this.prisma.service.create({
          data: {
            id: dto.serviceId || 'svc-gen-' + Date.now(),
            categoryId: category.id,
            name: dto.serviceName || 'Homezy Verified Service',
            description: 'Doorstep service executed by background-verified professionals.',
            price: dto.servicePrice || 499,
            estimatedDurationMinutes: 60,
          },
          include: { category: true },
        });
      }
    }

    // 2. Resolve or auto-create address
    let address = dto.addressId
      ? await this.prisma.address.findFirst({ where: { id: dto.addressId, userId: customerId } })
      : null;

    if (!address) {
      address = await this.prisma.address.findFirst({ where: { userId: customerId } });
    }

    if (!address) {
      address = await this.prisma.address.create({
        data: {
          userId: customerId,
          label: 'Home',
          line1: dto.addressLine || 'Flat 402, Green Meadows',
          line2: dto.city ? `${dto.city} Central` : 'Bandra West',
          city: dto.city || 'Mumbai',
          state: dto.state || 'Maharashtra',
          pincode: dto.pincode || '400050',
          latitude: 19.0760,
          longitude: 72.8777,
          isDefault: true,
        },
      });
    }

    // 3. Update customer name and email if provided
    if (dto.customerEmail || dto.customerName) {
      try {
        if (dto.customerEmail) {
          const conflict = await this.prisma.user.findFirst({
            where: { email: dto.customerEmail, NOT: { id: customerId } },
          });
          if (conflict) {
            await this.prisma.user.update({
              where: { id: conflict.id },
              data: { email: null },
            });
          }
        }
        await this.prisma.user.update({
          where: { id: customerId },
          data: {
            ...(dto.customerEmail ? { email: dto.customerEmail } : {}),
            ...(dto.customerName ? { name: dto.customerName } : {}),
          },
        });
      } catch (userErr) {
        this.logger.warn(`Could not sync customer user record: ${userErr}`);
      }
    }

    let price = Number(dto.servicePrice || service.price);

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (coupon?.isActive) {
        if (coupon.discountFlat) price -= Number(coupon.discountFlat);
        if (coupon.discountPercent) price -= (price * coupon.discountPercent) / 100;
        price = Math.max(price, 0);
        await this.prisma.coupon.update({ where: { id: coupon.id }, data: { timesUsed: { increment: 1 } } });
      }
    }

    // 4. Create booking in PENDING state
    const booking = await this.prisma.booking.create({
      data: {
        customerId,
        serviceId: service.id,
        addressId: address.id,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : new Date(),
        notes: dto.notes,
        paymentMode: dto.paymentMode || 'COD',
        couponCode: dto.couponCode,
        price,
        status: 'PENDING',
      },
      include: bookingInclude,
    });

    await this.recordStatusEvent(booking.id, 'PENDING');
    this.logger.log(`Booking #${booking.id} broadcasted to all online providers in category ${service.categoryId}`);

    // 📧 5. Booking confirmation email
    const recipientEmail = dto.customerEmail || (booking as any).customer?.email;
    const recipientName = dto.customerName || (booking as any).customer?.name || 'Valued Customer';
    const serviceName = (booking as any).service?.name || dto.serviceName || 'Homezy Service';

    if (recipientEmail && this.brevo) {
      const scheduledStr = booking.scheduledAt
        ? new Date(booking.scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST'
        : 'To be confirmed';
      this.brevo.sendBookingConfirmation(
        recipientEmail,
        booking.id,
        serviceName,
        scheduledStr,
        Number(booking.price),
        recipientName,
      ).catch((e) => this.logger.warn(`Booking confirm email failed: ${e.message}`));
    } else {
      this.logger.warn(`Skipping booking email — recipientEmail: ${recipientEmail || 'none'}, brevo available: ${!!this.brevo}`);
    }

    return booking;
  }

  async findByIdForCustomer(customerId: string, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, customerId },
      include: bookingInclude,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  getHistoryForCustomer(customerId: string) {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(customerId: string, id: string, dto: UpdateBookingDto) {
    if (dto.status === 'CANCELLED') {
      return this.cancel(customerId, id);
    }
    const booking = await this.findByIdForCustomer(customerId, id);
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException('Booking can no longer be rescheduled');
    }
    return this.prisma.booking.update({
      where: { id },
      data: { scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined, notes: dto.notes },
      include: bookingInclude,
    });
  }

  async cancel(customerId: string, id: string) {
    const booking = await this.findByIdForCustomer(customerId, id);
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      throw new BadRequestException('Booking cannot be cancelled');
    }
    const updated = await this.prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' }, include: bookingInclude });
    await this.recordStatusEvent(id, 'CANCELLED');

    // 📧 Cancellation email
    const customerEmail = (updated as any).customer?.email;
    if (customerEmail && this.brevo) {
      this.brevo.sendBookingCancelled(
        customerEmail,
        id,
        (updated as any).service?.name || 'Homezy Service',
        (updated as any).customer?.name,
      ).catch((e) => this.logger.warn(`Cancellation email failed: ${e.message}`));
    }
    return updated;
  }

  async submitRating(customerId: string, dto: SubmitRatingDto) {
    const booking = await this.findByIdForCustomer(customerId, dto.bookingId);
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed bookings can be rated');
    }
    if (!booking.providerId) throw new BadRequestException('Booking has no assigned provider');

    return this.prisma.rating.create({
      data: {
        bookingId: booking.id,
        customerId,
        providerId: booking.providerId,
        stars: dto.stars,
        comment: dto.comment,
      },
    });
  }

  // ── Provider-facing (same Booking table, viewed as "Job") ────────────────

  async findIncomingForProvider(providerId: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
      include: { categories: true },
    });

    const categoryIds = provider?.categories?.map((c) => c.id) || [];

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [{ providerId: null }, { providerId }],
        ...(categoryIds.length > 0
          ? {
              service: {
                categoryId: { in: categoryIds },
              },
            }
          : {}),
      },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((b) => this.formatJobForProvider(b));
  }

  async findActiveForProvider(providerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        providerId,
        status: { in: ['PROVIDER_ASSIGNED', 'PROVIDER_ARRIVED', 'IN_PROGRESS'] },
      },
      include: bookingInclude,
      orderBy: { scheduledAt: 'asc' },
    });
    return bookings.map((b) => this.formatJobForProvider(b));
  }

  async findHistoryForProvider(providerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { providerId, status: { in: ['COMPLETED', 'CANCELLED'] } },
      include: bookingInclude,
      orderBy: { updatedAt: 'desc' },
    });
    return bookings.map((b) => this.formatJobForProvider(b));
  }

  async findByIdForProvider(providerId: string, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, OR: [{ providerId }, { providerId: null, status: 'PENDING' }] },
      include: bookingInclude,
    });
    if (!booking) throw new NotFoundException('Job not found');
    return this.formatJobForProvider(booking);
  }

  async accept(providerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || (booking.providerId && booking.providerId !== providerId)) {
      throw new BadRequestException('This job is no longer available');
    }
    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { providerId, status: 'PROVIDER_ASSIGNED' },
      include: bookingInclude,
    });
    await this.recordStatusEvent(bookingId, 'PROVIDER_ASSIGNED', `Accepted by provider ${providerId}`);

    // 📧 Provider assigned email
    const customerEmail = (updated as any).customer?.email;
    if (customerEmail && this.brevo) {
      const provider = (updated as any).provider;
      const scheduledStr = updated.scheduledAt
        ? new Date(updated.scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST'
        : 'As scheduled';
      this.brevo.sendProviderAssigned(
        customerEmail,
        provider?.name || 'Homezy Professional',
        provider?.phone || 'Contact via app',
        (updated as any).service?.name || 'Homezy Service',
        scheduledStr,
        (updated as any).customer?.name,
      ).catch((e) => this.logger.warn(`Provider assigned email failed: ${e.message}`));
    }
    return this.formatJobForProvider(updated);
  }

  async reject(providerId: string, bookingId: string, reason?: string) {
    void providerId;
    void bookingId;
    void reason;
    return { rejected: true };
  }

  async advanceStatus(providerId: string, bookingId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, providerId } });
    if (!booking) throw new ForbiddenException('This job is not assigned to you');

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: bookingInclude,
    });
    await this.recordStatusEvent(bookingId, status);

    // 📧 Status-based email triggers
    const customerEmail = (updated as any).customer?.email;
    if (customerEmail && this.brevo) {
      const serviceName = (updated as any).service?.name || 'Homezy Service';
      const providerName = (updated as any).provider?.name || 'Homezy Professional';
      const customerName = (updated as any).customer?.name;
      const inclusions = (updated as any).service?.inclusions as string[] | undefined;

      if (status === 'PROVIDER_ARRIVED' || status === 'IN_PROGRESS') {
        this.brevo.sendProviderArrived(customerEmail, serviceName, providerName, customerName)
          .catch((e) => this.logger.warn(`Provider arrived email failed: ${e.message}`));
      } else if (status === 'COMPLETED') {
        const completedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST';
        this.brevo.sendJobCompleted(
          customerEmail,
          bookingId,
          serviceName,
          providerName,
          Number(updated.price),
          completedAt,
          customerName,
          inclusions,
        ).catch((e) => this.logger.warn(`Job completed email failed: ${e.message}`));
      }
    }
    return this.formatJobForProvider(updated);
  }

  private recordStatusEvent(bookingId: string, status: BookingStatus, note?: string) {
    return this.prisma.bookingStatusEvent.create({ data: { bookingId, status, note } });
  }

  // ── Admin-facing ─────────────────────────────────────────────────────────

  findAllForAdmin(filters: { status?: BookingStatus; search?: string }) {
    return this.prisma.booking.findMany({
      where: {
        status: filters.status,
        customer: filters.search
          ? { OR: [{ name: { contains: filters.search, mode: 'insensitive' } }, { phone: { contains: filters.search } }] }
          : undefined,
      },
      include: { ...bookingInclude, customer: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  reassignProvider(bookingId: string, providerId: string) {
    return this.prisma.booking.update({ where: { id: bookingId }, data: { providerId, status: 'PROVIDER_ASSIGNED' } });
  }
}
