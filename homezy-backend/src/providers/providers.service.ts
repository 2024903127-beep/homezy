import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { BankDetailsDto } from './dto/bank-details.dto';
import { KycDocType } from '@prisma/client';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  getProfile(providerId: string) {
    return this.prisma.provider.findUniqueOrThrow({
      where: { id: providerId },
      include: { categories: true, coverageAreas: true },
    });
  }

  updateProfile(providerId: string, dto: UpdateProviderDto) {
    return this.prisma.provider.update({ where: { id: providerId }, data: dto });
  }

  setDuty(providerId: string, isOnDuty: boolean) {
    // Only verified providers should be allowed to go on duty â€” enforce
    // that rule here rather than trusting the app.
    return this.prisma.provider.update({
      where: { id: providerId },
      data: { isOnDuty },
    });
  }

  getKycDocuments(providerId: string) {
    return this.prisma.providerDocument.findMany({ where: { providerId }, orderBy: { uploadedAt: 'desc' } });
  }

  // fileUrl is expected to already be uploaded to Cloudinary/S3 by the
  // controller layer before this is called â€” see kyc upload note in README.
  async uploadKycDocument(providerId: string, type: KycDocType, fileUrl: string) {
    const existing = await this.prisma.providerDocument.findFirst({ where: { providerId, type } });
    if (existing) {
      return this.prisma.providerDocument.update({
        where: { id: existing.id },
        data: { fileUrl, status: 'PENDING', rejectionReason: null, uploadedAt: new Date(), reviewedAt: null },
      });
    }
    return this.prisma.providerDocument.create({ data: { providerId, type, fileUrl } });
  }

  getBankDetails(providerId: string) {
    return this.prisma.providerBankDetail.findUnique({ where: { providerId } });
  }

  saveBankDetails(providerId: string, dto: BankDetailsDto) {
    return this.prisma.providerBankDetail.upsert({
      where: { providerId },
      update: dto,
      create: { ...dto, providerId },
    });
  }

  updateLocation(providerId: string, latitude: number, longitude: number) {
    return this.prisma.provider.update({
      where: { id: providerId },
      data: {
        currentLat: latitude,
        currentLng: longitude,
      },
    });
  }

  getLiveLocation(providerId: string) {
    return this.prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        name: true,
        phone: true,
        currentLat: true,
        currentLng: true,
        isOnDuty: true,
        updatedAt: true,
      },
    });
  }

  // â”€â”€ Admin-facing helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  listForAdmin(filters: { verificationStatus?: string; search?: string }) {
    return this.prisma.provider.findMany({
      where: {
        verificationStatus: filters.verificationStatus as any,
        OR: filters.search
          ? [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { phone: { contains: filters.search } },
              { email: { contains: filters.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: { documents: true, categories: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setVerificationStatus(providerId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.provider.update({
      where: { id: providerId },
      data: { verificationStatus: status },
    });
  }

  assignCategories(providerId: string, categoryIds: string[]) {
    return this.prisma.provider.update({
      where: { id: providerId },
      data: { categories: { set: categoryIds.map((id) => ({ id })) } },
    });
  }

  setCoverageAreas(providerId: string, pincodes: string[]) {
    return this.prisma.$transaction([
      this.prisma.providerCoverage.deleteMany({ where: { providerId } }),
      this.prisma.providerCoverage.createMany({
        data: pincodes.map((pincode) => ({ providerId, pincode })),
      }),
    ]);
  }

  async getEarningsSummary(providerId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedBookings = await this.prisma.booking.findMany({
      where: { providerId, status: 'COMPLETED' },
      select: { price: true, updatedAt: true },
    });

    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    let completedJobsToday = 0;

    for (const b of completedBookings) {
      const price = Number(b.price) || 0;
      const date = new Date(b.updatedAt);
      if (date >= startOfToday) {
        todayEarnings += price;
        completedJobsToday += 1;
      }
      if (date >= startOfWeek) {
        weekEarnings += price;
      }
      if (date >= startOfMonth) {
        monthEarnings += price;
      }
    }

    return {
      todayEarnings,
      weekEarnings,
      monthEarnings,
      completedJobsToday,
      completedJobsTotal: completedBookings.length,
    };
  }

  async getEarningsHistory(providerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { providerId, status: 'COMPLETED' },
      include: { service: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return bookings.map((b) => ({
      jobId: b.id,
      serviceName: b.service?.name || 'Homezy Service',
      amount: Number(b.price) || 0,
      completedAt: b.updatedAt.toISOString(),
    }));
  }

}
