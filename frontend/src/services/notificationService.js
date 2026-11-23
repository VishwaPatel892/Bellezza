import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure notification behavior for Expo SDK 58 & cross-platform
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  // Web / unsupported platform
}

export const notificationService = {
  /**
   * Request notification permissions
   */
  requestPermissions: async () => {
    if (Platform.OS === 'web') return true;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Schedule daily morning routine reminder (08:00 AM IST)
   */
  scheduleMorningReminder: async (hour = 8, minute = 0) => {
    if (Platform.OS === 'web') return null;
    try {
      await Notifications.cancelScheduledNotificationAsync('bellezza_morning_ritual').catch(() => null);
      return await Notifications.scheduleNotificationAsync({
        identifier: 'bellezza_morning_ritual',
        content: {
          title: 'Morning Skincare Ritual ✨',
          body: 'Time for gentle cleansing, active serum, and broad-spectrum SPF 50 photoprotection.',
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
    } catch {
      return null;
    }
  },

  /**
   * Schedule daily evening routine reminder (09:00 PM IST)
   */
  scheduleEveningReminder: async (hour = 21, minute = 0) => {
    if (Platform.OS === 'web') return null;
    try {
      await Notifications.cancelScheduledNotificationAsync('bellezza_evening_recovery').catch(() => null);
      return await Notifications.scheduleNotificationAsync({
        identifier: 'bellezza_evening_recovery',
        content: {
          title: 'Nocturnal Skin Recovery 🌙',
          body: 'Dissolve daily pollutants and nourish your epidermal barrier with overnight ceramides.',
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
    } catch {
      return null;
    }
  },

  /**
   * Schedule custom sunscreen reapplication reminder
   */
  scheduleSunscreenReminder: async (minutesFromNow = 180) => {
    if (Platform.OS === 'web') return null;
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Sunscreen Reapplication Check ☀️',
          body: 'High UV exposure: reapply your sunscreen to maintain tested photoprotective shield.',
          sound: true,
        },
        trigger: {
          seconds: minutesFromNow * 60,
        },
      });
    } catch {
      return null;
    }
  },

  /**
   * Cancel all reminders
   */
  cancelAll: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}
  },
};

export default notificationService;
