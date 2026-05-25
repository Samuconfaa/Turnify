import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, Card, Chip, Header, Icon, StatusBadge } from '@/components/ui';
import { VacationService } from '@/services/vacation.service';
import { apiError } from '@/services/api';
import { textOnPrimary } from '@/constants/tokens';
import type { ShiftSwapRequest } from '@/types/shift.types';

type FilterType = 'all' | 'Pending' | 'Accepted' | 'Rejected';

const FILTERS: Array<{ label: string; value: FilterType }> = [
  { label: 'Tutte', value: 'all' },
  { label: 'In attesa', value: 'Pending' },
  { label: 'Accettati', value: 'Accepted' },
  { label: 'Rifiutati', value: 'Rejected' },
];

function initials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'poco fa';
  if (hours < 24) return `${hours} ${hours === 1 ? 'ora' : 'ore'} fa`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ieri';
  if (days < 7) return `${days} giorni fa`;
  return `${Math.floor(days / 7)} sett. fa`;
}

function swapStatus(status: ShiftSwapRequest['status']) {
  if (status === 'Pending') return 'pending' as const;
  if (status === 'Accepted' || status === 'AdminApproved') return 'approved' as const;
  return 'rejected' as const;
}

function swapIconColor(status: ShiftSwapRequest['status'], t: any): string {
  if (status === 'Pending') return t.primary;
  if (status === 'Accepted' || status === 'AdminApproved') return t.successText;
  return t.errorText;
}

export default function ShiftSwapsScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [swaps, setSwaps] = useState<ShiftSwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const textOnPri = textOnPrimary(t);

  const load = useCallback(async (f: FilterType) => {
    try {
      const data = await VacationService.getSwapRequests(f !== 'all' ? { status: f } : undefined).catch(() => []);
      setSwaps(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter]);
  const onRefresh = () => { setRefreshing(true); load(filter); };

  const handleApprove = async (id: number) => {
    try {
      await VacationService.approveSwap(id);
      setSwaps(prev => prev.map(s => s.id === id ? { ...s, status: 'AdminApproved' } : s));
    } catch (e) { Alert.alert('Errore', apiError(e)); }
  };

  const handleReject = async (id: number) => {
    try {
      await VacationService.rejectSwap(id);
      setSwaps(prev => prev.map(s => s.id === id ? { ...s, status: 'AdminRejected' } : s));
    } catch (e) { Alert.alert('Errore', apiError(e)); }
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Scambi turno"
          leading={
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="chev-l" size={20} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f, i) => (
            <Chip key={i} t={t} label={f.label} active={filter === f.value} onPress={() => setFilter(f.value)} />
          ))}
        </ScrollView>

        {loading ? (
          <Text style={[styles.empty, { color: t.textSecondary }]}>Caricamento…</Text>
        ) : swaps.length === 0 ? (
          <Text style={[styles.empty, { color: t.textSecondary }]}>Nessuno scambio trovato</Text>
        ) : (
          swaps.map(sw => {
            const isPending = sw.status === 'Pending';
            const iconColor = swapIconColor(sw.status, t);
            return (
              <Card key={sw.id} t={t} padding={14}>
                {/* Status + time */}
                <View style={styles.topRow}>
                  <StatusBadge t={t} kind={swapStatus(sw.status)} />
                  <Text style={[styles.timeAgo, { color: t.textSecondary }]}>{relativeTime(sw.createdAt)}</Text>
                </View>

                {/* Requestor shift */}
                <View style={styles.empRow}>
                  <Avatar t={t} initials={initials(sw.requestorEmployeeName)} size={36} />
                  <Text style={[styles.empShift, { color: t.text }]}>{sw.requestorEmployeeName} · turno #{sw.requestorShiftId}</Text>
                </View>

                {/* Swap divider */}
                <View style={styles.swapDivider}>
                  <Icon name="swap" size={18} color={iconColor} strokeWidth={2} />
                  <View style={[styles.dividerLine, { backgroundColor: t.borderSoft }]} />
                </View>

                {/* Target shift */}
                <View style={styles.empRow}>
                  <Avatar t={t} initials={initials(sw.targetEmployeeName)} size={36} bg={t.warningBg} color={t.warningText} />
                  <Text style={[styles.empShift, { color: t.text }]}>{sw.targetEmployeeName} · turno #{sw.targetShiftId}</Text>
                </View>

                {/* Actions for pending */}
                {isPending && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: t.primary }]}
                      onPress={() => handleApprove(sw.id)}>
                      <Text style={[styles.actionTxt, { color: textOnPri }]}>Accetta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.rejectBtn, { borderColor: t.danger }]}
                      onPress={() => handleReject(sw.id)}>
                      <Text style={[styles.actionTxt, { color: t.danger }]}>Rifiuta</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 10, paddingBottom: 32 },
  chips: { gap: 8, paddingBottom: 4 },
  empty: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, textAlign: 'center', padding: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  timeAgo: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, marginLeft: 'auto' },
  empRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  empShift: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 13, flex: 1 },
  swapDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 4 },
  dividerLine: { flex: 1, height: 1 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  acceptBtn: { flex: 1, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { flex: 1, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actionTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
});
