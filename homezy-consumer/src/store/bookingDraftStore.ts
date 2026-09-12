import { create } from 'zustand';
import { Address, Service } from '@/types/models';

interface BookingDraftState {
  service: Service | null;
  address: Address | null;
  scheduledAt: Date | null; // null = instant booking
  notes: string;
  paymentMode: 'COD' | 'ONLINE';
  couponCode?: string;
  setService: (service: Service) => void;
  setAddress: (address: Address) => void;
  setScheduledAt: (date: Date | null) => void;
  setNotes: (notes: string) => void;
  setPaymentMode: (mode: 'COD' | 'ONLINE') => void;
  setCoupon: (code?: string) => void;
  reset: () => void;
}

const initialState = {
  service: null,
  address: null,
  scheduledAt: null,
  notes: '',
  paymentMode: 'COD' as const,
  couponCode: undefined,
};

export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  ...initialState,
  setService: (service) => set({ service }),
  setAddress: (address) => set({ address }),
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),
  setNotes: (notes) => set({ notes }),
  setPaymentMode: (paymentMode) => set({ paymentMode }),
  setCoupon: (couponCode) => set({ couponCode }),
  reset: () => set(initialState),
}));
