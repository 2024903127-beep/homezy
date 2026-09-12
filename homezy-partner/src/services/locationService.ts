/**
 * locationService.ts - Homezy Partner
 * Handles partner location tracking, permission verification for on-duty status, and navigation.
 */
import * as Location from 'expo-location';
import apiClient from './apiClient';

export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('[partner locationService] Permission request error:', error);
    return false;
  }
}

export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('[partner locationService] Permission check error:', error);
    return false;
  }
}

export async function getProviderCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const granted = await requestLocationPermissions();
    if (!granted) return null;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const coords = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };

    // Broadcast position to backend so customer can track live
    try {
      await apiClient.patch('/provider/me/location', coords);
    } catch {
      // Non-blocking background sync
    }

    return coords;
  } catch (error) {
    console.warn('[partner locationService] Position error:', error);
    return null;
  }
}

// Background location watcher to continuously broadcast partner position while on duty
let locationWatcherSubscription: Location.LocationSubscription | null = null;

export async function startBroadcastingLocation(onLocation?: (coords: { latitude: number; longitude: number }) => void) {
  try {
    const granted = await requestLocationPermissions();
    if (!granted) return;

    if (locationWatcherSubscription) {
      locationWatcherSubscription.remove();
    }

    locationWatcherSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 15, // Update every 15 meters
        timeInterval: 10000,   // Or every 10 seconds
      },
      (loc) => {
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        apiClient.patch('/provider/me/location', coords).catch(() => {});
        onLocation?.(coords);
      }
    );
  } catch (err) {
    console.warn('[partner locationService] Watch error:', err);
  }
}

export function stopBroadcastingLocation() {
  if (locationWatcherSubscription) {
    locationWatcherSubscription.remove();
    locationWatcherSubscription = null;
  }
}

export async function setDutyStatus(isAvailable: boolean): Promise<boolean> {
  try {
    await apiClient.patch('/provider/me/status', { isAvailable });
    if (isAvailable) {
      await startBroadcastingLocation();
    } else {
      stopBroadcastingLocation();
    }
    return true;
  } catch (error) {
    console.warn('[partner locationService] setDutyStatus error:', error);
    return false;
  }
}
