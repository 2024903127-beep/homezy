/**
 * useNotifications hook - Homezy Consumer
 *
 * Handles push notification registration and deep-link navigation from tapped notifications.
 * Completely safe in Expo Go - all expo-notifications calls are skipped at runtime.
 */
import { useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import {
  setupNotificationHandler,
  registerForPushNotifications,
  uploadPushToken,
  isRunningInExpoGo,
} from '@/services/notificationService';

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // We store subscription refs as `any` to avoid a static type import of expo-notifications
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Always setup the handler first (no-op in Expo Go)
    setupNotificationHandler();

    if (!isAuthenticated) return;

    // Expo Go (SDK 53+): push notifications not supported - bail out completely
    if (isRunningInExpoGo()) {
      console.log(
        '[useNotifications] Expo Go mode detected.\n' +
        'Push notifications are not supported in Expo Go SDK 53+.\n' +
        'Run `npx expo run:android` for a dev build with full push support.',
      );
      return;
    }

    // Standalone / dev-client: full push support
    registerForPushNotifications().then((token) => {
      if (token) uploadPushToken(token);
    });

    // Dynamically import listeners only in builds that support it
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Notifications = require('expo-notifications') as typeof import('expo-notifications');

      notificationListener.current = Notifications.addNotificationReceivedListener(() => {
        // setNotificationHandler in notificationService handles foreground display.
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response: import('expo-notifications').NotificationResponse) => {
          const data = response.notification.request.content.data as Record<string, string>;
          if (data?.bookingId) {
            navigation.navigate('BookingsTab', {
              screen: 'BookingTracking',
              params: { bookingId: data.bookingId },
            });
          }
        },
      );
    } catch (err) {
      console.warn('[useNotifications] Failed to setup notification listeners:', err);
    }

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, navigation]);
}
