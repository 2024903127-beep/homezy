'use client';

import React, { useState } from 'react';
import { MapPin, Bell, X, Navigation, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { useLocation } from '@/lib/locationContext';

export default function PermissionPrompt() {
  const {
    location,
    isLocating,
    locationPermission,
    notificationPermission,
    detectLocation,
    requestNotificationPermission,
    promptDismissed,
    dismissPrompt,
  } = useLocation();

  const [notificationGranted, setNotificationGranted] = useState(false);

  // If user already granted location and notification or dismissed, don't show prompt
  if (promptDismissed) return null;
  if (locationPermission === 'granted' && (notificationPermission === 'granted' || notificationGranted)) return null;

  const handleAllowLocation = async () => {
    await detectLocation();
  };

  const handleAllowNotifications = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      setNotificationGranted(true);
    }
  };

  return (
    <aside aria-label="Permissions" className="fixed bottom-5 right-5 z-50 max-w-sm w-full p-1 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-emerald-100 shadow-emerald-950/10 relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Close / Dismiss */}
        <button
          onClick={dismissPrompt}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Dismiss permission prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-xs">
            <MapPin className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Enable Location Access</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Find verified service professionals near you and auto-fill your doorstep delivery address.
            </p>
          </div>
        </div>

        {/* Permissions Action Buttons */}
        <div className="mt-4 space-y-2">
          {locationPermission !== 'granted' && (
            <button
              onClick={handleAllowLocation}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS Location...' : 'Use Current Location'}</span>
            </button>
          )}

          {locationPermission === 'granted' && (
            <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Location set to: {location.area || location.city}</span>
            </div>
          )}

          {notificationPermission !== 'granted' && !notificationGranted && (
            <button
              onClick={handleAllowNotifications}
              className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enable Notifications for Booking Updates</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Private & secure</span>
            </span>
            <button
              onClick={dismissPrompt}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 hover:underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
