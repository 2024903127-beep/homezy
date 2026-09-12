/**
 * locationService.ts - Homezy Consumer
 * Handles GPS location requests, permission checks, and reverse geocoding.
 */
import * as Location from 'expo-location';

export interface LocationResult {
  latitude: number;
  longitude: number;
  line1?: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  formattedAddress: string;
}

export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('[locationService] Permission request error:', error);
    return false;
  }
}

export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('[locationService] Permission check error:', error);
    return false;
  }
}

export async function getCurrentLocationAddress(): Promise<LocationResult | null> {
  try {
    const granted = await requestLocationPermissions();
    if (!granted) {
      return null;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = pos.coords;

    // Reverse geocode
    const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (addresses && addresses.length > 0) {
      const a = addresses[0];
      const city = a.city || a.subregion || a.district || 'New Delhi';
      const state = a.region || 'Delhi';
      const pincode = a.postalCode || '110001';
      const street = a.street || a.name || '';
      const district = a.district || a.subregion || '';

      const line1 = street ? `${street}` : (a.name || `${district}`);
      const line2 = district && district !== street ? district : '';
      const formattedAddress = [line1, line2, city, state, pincode].filter(Boolean).join(', ');

      return {
        latitude,
        longitude,
        line1,
        line2,
        city,
        state,
        pincode,
        formattedAddress,
      };
    }

    // Default fallback if reverse geocoding returned empty
    return {
      latitude,
      longitude,
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      formattedAddress: 'Current GPS Location, New Delhi',
    };
  } catch (error) {
    console.warn('[locationService] getCurrentLocationAddress error:', error);
    return null;
  }
}
