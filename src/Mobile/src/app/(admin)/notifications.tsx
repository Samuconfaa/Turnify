import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { AdminTabLayout } from '@/components/AdminTabLayout';
import { Header, Icon, SmallPill } from '@/components/ui';
import { NotificationService } from '@/services/notification.service';
import { textOnPrimary } from '@/constants/tokens';
import type { Notification } from '@/types/notification.types';

function iconForType(type: string): { icon: string; bg: string; color: string } {
  switch (type?.toLowerCase()) {
    case 'shift': return { icon: 'cal', bg: '#E3F2FD', color: '#1565C0' };
    case 'vacation': return { icon: 'palm', bg: '#FFF9C4', color: '#F59E0B' };
    case 'swap': return { icon: 'swap', bg: '#EEE5F7', color: '#6D28D9' };
    case 'attendance': return { icon: 'clock', bg: '#E8F5E9', color: '#2E7D32' };
    default: return { icon: 'bell', bg: '#F0F0F0', color: '#666' };
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} min fa`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ore fa`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ieri';
  if (d < 7) return `${d} giorni fa`;
  return `${Math.floor(d / 7)} sett. fa`;
}

export default function AdminNotificationsScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const textOnPri = textOnPrimary(t);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await NotificationService.getNotifications();
      setItems(data);
    } catch {
      // API non disponibile — lista vuota
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const markRead = async (id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isRead: true } : i));
    await NotificationService.markAsRead(id).catch(() => {});
  };

  const markAllRead = async () => {
    setItems(prev => prev.map(i => ({ ...i, isRead: true })));
    await NotificationService.markAllAsRead().catch(() => {});
  };

  const deleteOne = async (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await NotificationService.deleteNotification(id).catch(() => {});
  };

  const deleteAll = async () => {
    setItems([]);
    await NotificationService.deleteAllNotifications().catch(() => {});
  };

  const unreadCount = items.filter(i => !i.isRead).length;

  return (
    <AdminTabLayout>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Notifiche"
          trailing={
            items.length > 0 ? (
              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllRead}>
                    <Text style={[styles.headerBtn, { color: t.primary }]}>Segna lette</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={deleteAll}>
                  <Icon name="trash" size={18} color={t.danger ?? '#E53E3E'} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ) : undefined
          }
        />
      </View>

      {unreadCount > 0 && (
        <View style={styles.badge}>
          <SmallPill bg={t.primary} color={textOnPri} style={{ height: 26 }}>
            {unreadCount} non {unreadCount === 1 ? 'letta' : 'lette'}
          </SmallPill>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
      >
        {loading ? (
          <Text style={[styles.empty, { color: t.textSecondary }]}>Caricamento…</Text>
        ) : items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Icon name="bell" size={32} color={t.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.empty, { color: t.textSecondary }]}>Nessuna notifica</Text>
          </View>
        ) : (
          items.map(item => {
            const ic = iconForType(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, {
                  backgroundColor: !item.isRead ? t.surfaceLow : t.surface,
                  borderColor: !item.isRead ? t.borderSoft ?? t.border : t.border,
                }]}
                activeOpacity={0.75}
                onPress={() => markRead(item.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: ic.bg }]}>
                  <Icon name={ic.icon as any} size={20} color={ic.color} strokeWidth={2} />
                </View>
                <View style={styles.flex1}>
                  <Text style={[styles.itemTitle, { color: t.text }]}>{item.title}</Text>
                  <Text style={[styles.itemBody, { color: t.textSecondary }]}>{item.body}</Text>
                  <Text style={[styles.itemWhen, { color: t.textSecondary }]}>{timeAgo(item.createdAt)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteOne(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="trash" size={16} color={t.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </AdminTabLayout>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12 },
  badge: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  body: { padding: 12, paddingHorizontal: 16, gap: 8, paddingBottom: 32 },
  item: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  flex1: { flex: 1, minWidth: 0 },
  itemTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  itemBody: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 3, lineHeight: 18 },
  itemWhen: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, marginTop: 6, opacity: 0.7 },
  deleteBtn: { padding: 4, flexShrink: 0 },
  emptyBox: { alignItems: 'center', gap: 12, paddingTop: 60 },
  empty: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, textAlign: 'center' },
});
