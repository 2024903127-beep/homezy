export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type BookingStatus = 'PENDING'|'CONFIRMED'|'PROVIDER_ASSIGNED'|'PROVIDER_ARRIVED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED';
export type AdminRole = 'SUPER_ADMIN' | 'OPS' | 'SUPPORT' | 'FINANCE';
export interface AdminUser { id: string; name: string; email: string; role: AdminRole; }
export interface Customer { id: string; name?: string; phone: string; email?: string; isActive: boolean; createdAt: string; }
export interface Provider {
  id: string; name?: string; phone: string; email?: string;
  verificationStatus: VerificationStatus; isOnDuty: boolean; isActive: boolean;
  rating?: number; completedJobs?: number;
  categories: Category[]; documents?: ProviderDocument[]; createdAt: string;
}
export interface ProviderDocument { id: string; type: 'ID_PROOF'|'ADDRESS_PROOF'|'CERTIFICATION'|'PHOTO'; fileUrl: string; status: VerificationStatus; uploadedAt: string; }
export interface Category { id: string; name: string; iconUrl?: string; isActive: boolean; displayOrder: number; }
export interface Service {
  id: string; categoryId: string; category?: Category; name: string; description: string;
  price: number; estimatedDurationMinutes: number; imageUrl?: string;
  inclusions: string[]; exclusions: string[]; isActive: boolean;
}
export interface Booking {
  id: string; status: BookingStatus; scheduledAt: string; price: number;
  paymentMode: 'COD'|'ONLINE'; paymentStatus: 'PENDING'|'PAID'|'FAILED'|'REFUNDED';
  notes?: string; customer: Customer; provider?: Provider; service: Service; createdAt: string;
}
export interface Coupon { id: string; code: string; description: string; discountPercent?: number; discountFlat?: number; isActive: boolean; validFrom?: string; validUntil?: string; usageLimit?: number; timesUsed: number; }
export interface Banner { id: string; imageUrl: string; linkType?: string; linkValue?: string; isActive: boolean; displayOrder: number; }
export interface DashboardSummary { totalUsers: number; totalProviders: number; activeProviders: number; pendingVerifications: number; ongoingBookings: number; completedBookings: number; cancelledBookings: number; totalRevenue: number; }
export interface BookingsTrendPoint { date: string; bookings: number; revenue: number; }
