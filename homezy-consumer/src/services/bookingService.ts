import apiClient from './apiClient';
import { Address, Booking, Rating } from '@/types/models';

export interface CreateBookingPayload {
  serviceId: string;
  addressId: string;
  scheduledAt: string;
  notes?: string;
  paymentMode: 'COD' | 'ONLINE';
  couponCode?: string;
  customerEmail?: string;
  customerName?: string;
  /** Final price shown to user: basePrice - couponDiscount + convenienceFee */
  servicePrice?: number;
}

export const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    label: 'Home',
    line1: '221B, MG Road, DLF Cyber City',
    line2: 'Sector 24',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    latitude: 28.4908,
    longitude: 77.0917,
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Office',
    line1: 'Plot 45, Sector 44',
    line2: 'Near HUDA City Centre',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122003',
    latitude: 28.4595,
    longitude: 77.0266,
    isDefault: false,
  },
];

export const MOCK_BOOKING: Booking = {
  id: 'bk-1001',
  serviceId: 'svc-ac-1',
  service: {
    id: 'svc-ac-1',
    categoryId: 'ac-maintenance',
    name: 'AC Foam & Power Jet Service',
    description: 'Deep cleaning of indoor and outdoor AC units with jet pump & anti-bacterial foam.',
    price: 499,
    estimatedDurationMinutes: 60,
    inclusions: ['Indoor & Outdoor unit cleaning', 'Gas pressure check', '30-day warranty'],
    exclusions: ['Spare parts & refrigerant gas refill'],
    isActive: true,
  },
  addressId: 'addr-1',
  address: MOCK_ADDRESSES[0],
  status: 'COMPLETED',
  price: 499,
  scheduledAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  notes: 'Please bring a step ladder and clean filters.',
  provider: {
    id: 'prov-1',
    name: 'Amit Kumar',
    phone: '+91 9876543210',
    photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    rating: 4.9,
  },
  paymentMode: 'ONLINE',
  paymentStatus: 'PAID',
  createdAt: new Date().toISOString(),
};

// POST /booking
export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  try {
    // If addressId is a local mock id (e.g. 'addr-1'), ensure address exists in the backend DB first
    let validAddressId = payload.addressId;
    const matchingAddr = MOCK_ADDRESSES.find((a) => a.id === validAddressId) || MOCK_ADDRESSES[0];
    if (validAddressId.startsWith('addr-')) {
      try {
        const saved = await saveAddress({
          label: matchingAddr.label,
          line1: matchingAddr.line1,
          line2: matchingAddr.line2,
          city: matchingAddr.city,
          state: matchingAddr.state,
          pincode: matchingAddr.pincode,
          latitude: matchingAddr.latitude,
          longitude: matchingAddr.longitude,
          isDefault: matchingAddr.isDefault,
        });
        validAddressId = saved.id;
      } catch (addrErr) {
        console.warn('[bookingService] Could not pre-save address:', addrErr);
      }
    }

    const { data } = await apiClient.post('/booking', {
      ...payload,
      addressId: validAddressId,
      addressLine: matchingAddr.line1,
      city: matchingAddr.city,
      state: matchingAddr.state,
      pincode: matchingAddr.pincode,
      customerEmail: payload.customerEmail,
      customerName: payload.customerName,
    });
    return data;
  } catch (error: any) {
    console.error('[bookingService] createBooking API failed:', error?.response?.data || error.message);
    // Throw error so screen can show toast/feedback, rather than pretending booking succeeded
    throw error;
  }
}

// PATCH /booking/:id - reschedule / cancel
export async function updateBooking(
  id: string,
  update: Partial<Pick<Booking, 'scheduledAt' | 'status' | 'notes'>>
): Promise<Booking> {
  try {
    const { data } = await apiClient.patch(`/booking/${id}`, update);
    return data;
  } catch (error) {
    console.warn('[bookingService] updateBooking offline fallback:', error);
    return { ...MOCK_BOOKING, id, ...update };
  }
}

// GET /history
export async function getBookingHistory(): Promise<Booking[]> {
  try {
    const { data } = await apiClient.get('/history');
    if (Array.isArray(data) && data.length) return data;
    return [MOCK_BOOKING];
  } catch (error) {
    console.warn('[bookingService] getBookingHistory fallback:', error);
    return [MOCK_BOOKING];
  }
}

export async function getBookingById(id: string): Promise<Booking> {
  if (!id || id === 'bk-1001' || id.startsWith('bk-') || id.startsWith('mock-')) {
    return { ...MOCK_BOOKING, id: id || 'bk-1001' };
  }
  try {
    const { data } = await apiClient.get(`/booking/${id}`);
    if (data) return data;
    return { ...MOCK_BOOKING, id };
  } catch (error) {
    return { ...MOCK_BOOKING, id };
  }
}

// POST /payment
export async function initiatePayment(bookingId: string): Promise<{ orderId?: string; gateway: string }> {
  try {
    const { data } = await apiClient.post('/payment', { bookingId });
    return data;
  } catch {
    return { orderId: `order_${Math.random().toString(36).substring(7)}`, gateway: 'RAZORPAY_MOCK' };
  }
}

// POST /rating
export async function submitRating(rating: Rating): Promise<void> {
  try {
    await apiClient.post('/rating', rating);
  } catch (error) {
    console.warn('[bookingService] submitRating fallback:', error);
  }
}

// Address book CRUD
export async function getAddresses(): Promise<Address[]> {
  try {
    const { data } = await apiClient.get('/users/me/addresses');
    if (Array.isArray(data) && data.length) return data;
    return MOCK_ADDRESSES;
  } catch (error) {
    console.warn('[bookingService] getAddresses fallback:', error);
    return MOCK_ADDRESSES;
  }
}

export async function saveAddress(address: Omit<Address, 'id'> & { id?: string }): Promise<Address> {
  try {
    if (address.id && !address.id.startsWith('addr-')) {
      const { data } = await apiClient.patch(`/users/me/addresses/${address.id}`, address);
      return data;
    }
    const { data } = await apiClient.post('/users/me/addresses', address);
    return data;
  } catch (error) {
    console.warn('[bookingService] saveAddress fallback:', error);
    const newAddress: Address = {
      id: address.id ?? `addr-${Date.now()}`,
      label: address.label ?? 'Home',
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      latitude: address.latitude ?? 28.6139,
      longitude: address.longitude ?? 77.2090,
      isDefault: address.isDefault ?? false,
    };
    return newAddress;
  }
}

export async function deleteAddress(id: string): Promise<void> {
  try {
    await apiClient.delete(`/users/me/addresses/${id}`);
  } catch {
    const idx = MOCK_ADDRESSES.findIndex((a) => a.id === id);
    if (idx !== -1) MOCK_ADDRESSES.splice(idx, 1);
  }
}


export async function getPartnerLiveLocation(partnerId: string): Promise<{ latitude: number; longitude: number; updatedAt: string } | null> {
  try {
    const { data } = await apiClient.get(`/provider/${partnerId}/location`);
    if (data?.currentLat && data?.currentLng) {
      return {
        latitude: data.currentLat,
        longitude: data.currentLng,
        updatedAt: data.updatedAt,
      };
    }
    return null;
  } catch {
    return null;
  }
}