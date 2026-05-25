import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { EmployeeTabLayout } from '@/components/EmployeeTabLayout';
import { Header, Icon, SmallPill } from '@/components/ui';
import { textOnPrimary } from '@/constants/tokens';

interface NotifItem {
  id: number;
  icon: any;
  bg: string;
  iconColor: string;
  title: string;
  body: string;
  when: string;
  unread: boolean;
}

export default function EmployeeNotificationsScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const textOnPri = textOnPrimary(t);
  const purpleBg = '#EEE5F7';
  const purpleColor = '#6D28D9';

  const [items, setItems] = useState<NotifItem[]>([
    { id: 1, icon: 'check', bg: t.primaryLight, iconColor: t.primary, title: 'Turno confermato', body: 'Il tuo turno di domani 09:00–13:00 è stato confermato.', when: '5 min fa', unread: true },
    { id: 2, icon: 'palm', bg: t.warningBg, iconColor: t.warningText, title: 'Ferie approvate', body: 'La tua richiesta di ferie è stata approvata.', when: '2 ore fa', unread: true },
    { id: 3, icon: 'swap', bg: purpleBg, iconColor: purpleColor, title: 'Proposta di scambio', body: 'Marco vuole scambiare il turno di Mer 22 con il tuo di Ven 24.', when: '4 ore fa', unread: true },
    { id: 4, icon: 'bell', bg: t.kpiBlueBg, iconColor: t.kpiBlue, title: 'Promemoria turno', body: 'Domani inizi alle 09:00 a Nord Café Centro.', when: 'ieri', unread: false },
    { id: 5, icon: 'x', bg: t.errorBg, iconColor: t.errorText, title: 'Permesso rifiutato', body: "La richiesta di permesso dell'8 maggio non è stata approvata.", when: '3 giorni fa', unread: false },
    { id: 6, icon: 'doc', bg: t.surfaceLow, iconColor: t.textSecondary, title: 'Report pronto', body: 'Il report ore di aprile 2026 è disponibile.', when: '1 sett. fa', unread: false },
  ]);

  const unreadCount = items.filter(i => i.unread).length;

  const markAllRead = () => setItems(prev => prev.map(i => ({ ...i, unread: false })));

  return (
    <EmployeeTabLayout>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Notifiche"
          trailing={
            <TouchableOpacity onPress={markAllRead}>
              <Text style={[styles.markRead, { color: t.primary }]}>Segna lette</Text>
            </TouchableOpacity>
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {items.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.item, {
              backgroundColor: item.unread ? t.surfaceLow : t.surface,
              borderColor: item.unread ? t.borderSoft : t.border,
            }]}
            activeOpacity={0.75}
            onPress={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, unread: false } : i))}
          >
            <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
              <Icon name={item.icon} size={20} color={item.iconColor} strokeWidth={2} />
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.itemTitle, { color: t.text }]}>{item.title}</Text>
              <Text style={[styles.itemBody, { color: t.textSecondary }]}>{item.body}</Text>
              <Text style={[styles.itemWhen, { color: t.textSecondary }]}>{item.when}</Text>
            </View>
            {item.unread && <View style={[styles.unreadDot, { backgroundColor: t.primary }]} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </EmployeeTabLayout>
  );
}

const styles = StyleSheet.create({
  markRead: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12 },
  badge: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  body: { padding: 12, paddingHorizontal: 16, gap: 8, paddingBottom: 32 },
  item: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  flex1: { flex: 1, minWidth: 0, paddingRight: 14 },
  itemTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  itemBody: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 3, lineHeight: 18 },
  itemWhen: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, marginTop: 6, opacity: 0.7 },
  unreadDot: { position: 'absolute', top: 14, right: 14, width: 6, height: 6, borderRadius: 3 },
});
