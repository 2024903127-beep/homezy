import { create } from 'zustand';
import { getCurrentLocationAddress, LocationResult } from '@/services/locationService';

interface LocationState {
  city: string;
  area: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  isAutoDetected: boolean;
  isDetecting: boolean;
  setLocation: (loc: Partial<LocationResult>) => void;
  detectLocation: () => Promise<LocationResult | null>;
}

export const useLocationStore = create<LocationState>((set) => ({
  city: 'New Delhi',
  area: 'Connaught Place',
  state: 'Delhi',
  pincode: '110001',
  latitude: 28.6139,
  longitude: 77.2090,
  formattedAddress: 'Connaught Place, New Delhi, 110001',
  isAutoDetected: false,
  isDetecting: false,

  setLocation: (loc) =>
    set((s) => ({
      city: loc.city || s.city,
      area: loc.line1 || loc.city || s.area,
      state: loc.state || s.state,
      pincode: loc.pincode || s.pincode,
      latitude: loc.latitude ?? s.latitude,
      longitude: loc.longitude ?? s.longitude,
      formattedAddress: loc.formattedAddress || s.formattedAddress,
      isAutoDetected: false,
    })),

  detectLocation: async () => {
    set({ isDetecting: true });
    try {
      const res = await getCurrentLocationAddress();
      if (res) {
        set({
          city: res.city,
          area: res.line1 || res.city,
          state: res.state,
          pincode: res.pincode,
          latitude: res.latitude,
          longitude: res.longitude,
          formattedAddress: res.formattedAddress,
          isAutoDetected: true,
          isDetecting: false,
        });
        return res;
      }
    } catch (e) {
      console.warn('detectLocation error:', e);
    }
    set({ isDetecting: false });
    return null;
  },
}));
