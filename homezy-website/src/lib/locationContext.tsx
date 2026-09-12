'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LocationData {
  city: string;
  area: string;
  pincode?: string;
  state?: string;
  latitude: number | null;
  longitude: number | null;
  formattedAddress?: string;
  isAutoDetected: boolean;
}

interface LocationContextType {
  location: LocationData;
  isLocating: boolean;
  locationPermission: 'prompt' | 'granted' | 'denied';
  notificationPermission: 'default' | 'granted' | 'denied';
  detectLocation: () => Promise<LocationData | null>;
  setCity: (city: string) => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  promptDismissed: boolean;
  dismissPrompt: () => void;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  'Mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'Delhi NCR': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'Bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
};

const DEFAULT_LOCATION: LocationData = {
  city: 'Mumbai',
  area: 'Andheri West',
  latitude: 19.0760,
  longitude: 72.8777,
  state: 'Maharashtra',
  isAutoDetected: false,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<LocationData>(DEFAULT_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [promptDismissed, setPromptDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('homezy_user_location');
      if (saved) {
        setLocationState(JSON.parse(saved));
      } else {
        const savedCity = localStorage.getItem('homezy_city');
        if (savedCity && CITY_COORDINATES[savedCity]) {
          const coords = CITY_COORDINATES[savedCity];
          setLocationState({
            city: savedCity,
            area: savedCity,
            latitude: coords.lat,
            longitude: coords.lng,
            state: coords.state,
            isAutoDetected: false,
          });
        }
      }

      const dismissed = localStorage.getItem('homezy_location_prompt_dismissed');
      if (dismissed === 'true') {
        setPromptDismissed(true);
      }

      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }

      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((status) => {
          setLocationPermission(status.state as 'prompt' | 'granted' | 'denied');
          status.onchange = () => {
            setLocationPermission(status.state as 'prompt' | 'granted' | 'denied');
          };
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Location initialization error:', e);
    }
  }, []);

  const setCity = (cityName: string) => {
    const coords = CITY_COORDINATES[cityName] || { lat: 19.0760, lng: 72.8777, state: 'India' };
    const updated: LocationData = {
      city: cityName,
      area: cityName,
      latitude: coords.lat,
      longitude: coords.lng,
      state: coords.state,
      isAutoDetected: false,
    };
    setLocationState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('homezy_user_location', JSON.stringify(updated));
      localStorage.setItem('homezy_city', cityName);
    }
  };

  const detectLocation = async (): Promise<LocationData | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return null;
    }

    setIsLocating(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocationPermission('granted');

          let detectedCity = 'Mumbai';
          let detectedArea = 'Current Location';
          let detectedState = '';
          let detectedPincode = '';
          let formattedAddress = '';

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              detectedCity = addr.city || addr.town || addr.municipality || addr.district || 'Mumbai';
              detectedArea = addr.suburb || addr.neighbourhood || addr.residential || addr.road || detectedCity;
              detectedState = addr.state || '';
              detectedPincode = addr.postcode || '';
              formattedAddress = data.display_name || `${detectedArea}, ${detectedCity}`;
            }
          } catch (err) {
            console.warn('Reverse geocoding failed, falling back to nearest city:', err);
            let minDistance = Infinity;
            Object.entries(CITY_COORDINATES).forEach(([cName, cCoords]) => {
              const dist = Math.hypot(lat - cCoords.lat, lng - cCoords.lng);
              if (dist < minDistance) {
                minDistance = dist;
                detectedCity = cName;
                detectedArea = cName;
                detectedState = cCoords.state;
              }
            });
          }

          const detected: LocationData = {
            city: detectedCity,
            area: detectedArea,
            state: detectedState,
            pincode: detectedPincode,
            latitude: lat,
            longitude: lng,
            formattedAddress: formattedAddress,
            isAutoDetected: true,
          };

          setLocationState(detected);
          if (typeof window !== 'undefined') {
            localStorage.setItem('homezy_user_location', JSON.stringify(detected));
            localStorage.setItem('homezy_city', detectedCity);
          }
          setIsLocating(false);
          setPromptDismissed(true);
          resolve(detected);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setIsLocating(false);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermission('denied');
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    });
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      return perm;
    } catch {
      return 'denied';
    }
  };

  const dismissPrompt = () => {
    setPromptDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('homezy_location_prompt_dismissed', 'true');
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isLocating,
        locationPermission,
        notificationPermission,
        detectLocation,
        setCity,
        requestNotificationPermission,
        promptDismissed,
        dismissPrompt,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
