/**
 * Notification Service - Homezy Consumer
 *
 * IMPORTANT: We NEVER use a top-level static `import` for expo-notifications.
 * In Expo Go (SDK 53+), the expo-notifications module runs native initialization
 * code at import time that immediately throws/warns and crashes the app.
 * Using dynamic require() inside functions prevents the module from loading at all
 * when we are inside Expo Go.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/** True when running inside Expo Go (vs standalone / dev-client build). */
export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Lazy-load expo-notifications ONLY in standalone / dev-client builds.
 * Returns null in Expo Go so callers can bail out safely.
 */
function getNotificationsModule(): typeof import('expo-notifications') | null {
  if (isRunningInExpoGo()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-notifications') as typeof import('expo-notifications');
  } catch {
    return null;
  }
}

/**
 * Call this once at app startup (not at module level!) to configure foreground behaviour.
 * Safe to call in Expo Go - it simply becomes a no-op.
 */
export function setupNotificationHandler(): void {
  const Notifications = getNotificationsModule();
  if (!Notifications) return; // Expo Go - skip

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    console.log(
      '[Notifications] Expo Go: push registration skipped. Use a dev build for full push support.',
    );
    return null;
  }

  try {
    // Must be a real device
    const Device = require('expo-device') as typeof import('expo-device');
    if (!Device.isDevice) {
      console.warn('[Notifications] Must use a physical device for push notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Push notification permissions not granted');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('homezy-default', {
        name: 'Homezy Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00B386',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync().catch((err: unknown) => {
      console.warn('[Notifications] getExpoPushTokenAsync error:', err);
      return null;
    });
    return tokenData ? tokenData.data : null;
  } catch (err) {
    console.warn('[Notifications] Error in registerForPushNotifications:', err);
    return null;
  }
}

export async function uploadPushToken(token: string): Promise<void> {
  try {
    const apiClient = (await import('./apiClient')).default;
    await apiClient.post('/notifications/device-token', { token, platform: Platform.OS });
  } catch (err) {
    console.warn('[Notifications] Failed to upload push token:', err);
  }
}
