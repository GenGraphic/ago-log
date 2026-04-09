import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';
import { Platform } from 'react-native';

import { db, DB_ID, USERS_TABLE_ID } from '@/appwrite';

export function usePushToken() {
  const registerPushToken = useCallback(async (userId: string) => {
    if (!userId) return;
    if (!Device.isDevice) return; // Expo push tokens don't work on simulators

    // Request permission
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    // Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    // Get token — projectId is required in production builds
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: 'e18c7339-07d2-45cf-93b5-85a6f91fc965',
    });
    if (!token) return;

    // Persist to DB so the backend function can read it
    await db.updateRow({
      databaseId: DB_ID,
      tableId: USERS_TABLE_ID,
      rowId: userId,
      data: { expoPushToken: token },
    });
  }, []);

  return { registerPushToken };
}
