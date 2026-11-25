import * as ExpoNotifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from './api';
import type { Notification } from '@/types/notification.types';

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async getDeviceToken(): Promise<string | null> {
    try {
      const granted = await NotificationService.requestPermissions();
      console.log('[Push] permissions granted:', granted);
      if (!granted) return null;
      const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
      console.log('[Push] projectId:', projectId);
      const token = await ExpoNotifications.getExpoPushTokenAsync({ projectId });
      console.log('[Push] token:', token.data);
      return token.data;
    } catch (e) {
      console.error('[Push] getDeviceToken error:', e);
      return null;
    }
  },

  async registerDeviceToken(): Promise<void> {
    try {
      const token = await NotificationService.getDeviceToken();
      if (!token) return;
      const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';
      await api.post('/api/device-tokens', { token, platform });
    } catch {
      // silently fail — non bloccante
    }
  },

  async getNotifications(): Promise<Notification[]> {
    const { data } = await api.get<{ data: Notification[] } | Notification[]>('/api/notifications');
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).data)) return (data as any).data;
    return [];
  },

  async markAsRead(id: number): Promise<void> {
    await api.put(`/api/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/api/notifications/read-all');
  },

  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/api/notifications/${id}`);
  },

  async deleteAllNotifications(): Promise<void> {
    await api.delete('/api/notifications');
  },
};
