export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;       // For crossed-out MRP display
  estimatedDurationMinutes: number;
  imageUrl?: string;
  images?: string[];
  inclusions?: string[];
  exclusions?: string[];
  isActive: boolean;
  // Display metadata (may come from backend or mock)
  badge?: string;               // e.g. "Best Seller", "Popular"
  rating?: number;              // e.g. 4.88
  reviews?: number;             // e.g. 3840
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROVIDER_ASSIGNED'
  | 'PROVIDER_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Booking {
  id: string;
  serviceId: string;
  service?: Service;
  addressId: string;
  address?: Address;
  scheduledAt: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  provider?: {
    id: string;
    name: string;
    phone: string;
    photoUrl?: string;
    rating?: number;
  };
  paymentMode: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
}

export interface Rating {
  bookingId: string;
  stars: number;
  comment?: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountPercent?: number;
  discountFlat?: number;
}
