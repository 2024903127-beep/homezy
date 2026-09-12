export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Provider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  categories?: string[]; // category IDs the provider is assigned to
  coverageAreas?: string[]; // pincodes or zone labels
  verificationStatus: VerificationStatus;
  isOnDuty: boolean;
  isActive: boolean;
  rating?: number;
  createdAt?: string;
}

export type KycDocType = 'ID_PROOF' | 'ADDRESS_PROOF' | 'CERTIFICATION' | 'PHOTO';

export interface KycDocument {
  id: string;
  type: KycDocType;
  fileUrl: string;
  status: VerificationStatus;
  uploadedAt: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  upiId?: string;
}

// Mirrors the customer app's BookingStatus — this is the same booking record,
// viewed from the provider's side. Keep in sync with homezy-consumer/src/types/models.ts
export type JobStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROVIDER_ASSIGNED'
  | 'PROVIDER_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Job {
  id: string; // same as Booking.id in the consumer app
  serviceName: string;
  categoryId: string;
  scheduledAt: string;
  status: JobStatus;
  price: number;
  paymentMode: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  customer: {
    name: string;
    phone: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };
  notes?: string;
  createdAt: string;
}

export interface EarningsSummary {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  completedJobsToday: number;
  completedJobsTotal: number;
}

export interface EarningsEntry {
  jobId: string;
  serviceName: string;
  amount: number;
  completedAt: string;
}
