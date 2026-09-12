import apiClient from './apiClient';
import { Coupon } from '@/types/models';

export interface ValidateCouponResponse {
  coupon: Coupon;
  discountAmount: number;
  finalAmount: number;
}

export const MOCK_COUPONS: Coupon[] = [
  {
    code: 'FIRST20',
    description: 'Get 20% off on your first booking',
    discountPercent: 20,
  },
  {
    code: 'HOMEZY100',
    description: 'Flat ₹100 off on bookings above ₹499',
    discountFlat: 100,
  },
];

export async function listCoupons(): Promise<Coupon[]> {
  try {
    const { data } = await apiClient.get('/coupons');
    return Array.isArray(data) && data.length ? data : MOCK_COUPONS;
  } catch {
    return MOCK_COUPONS;
  }
}

export async function validateCoupon(
  code: string,
  serviceId: string,
  originalAmount: number
): Promise<ValidateCouponResponse> {
  try {
    const { data } = await apiClient.post('/coupons/validate', { code, serviceId, originalAmount });
    return data;
  } catch {
    const cleanCode = code.toUpperCase().trim();
    let discount = 50;
    if (cleanCode === 'FIRST20') discount = Math.round(originalAmount * 0.2);
    if (cleanCode === 'HOMEZY100') discount = 100;
    discount = Math.min(discount, originalAmount);

    return {
      coupon: {
        code: cleanCode,
        description: `${cleanCode} discount applied`,
        discountFlat: discount,
      },
      discountAmount: discount,
      finalAmount: Math.max(0, originalAmount - discount),
    };
  }
}
