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
import type { VacationRequest, VacationStatus } from '@/types/vacation.types';

const FILTERS = [
  { label: 'Tutte', value: null },
  { label: 'In attesa', value: 'Pending' },
  { label: 'Approvate', value: 'Approved' },
  { label: 'Rifiutate', value: 'Rejected' },
] as const;

const TYPE_LABELS: Record<string, string> = {
  Holiday: 'Ferie', PaidLeave: 'Permesso', UnpaidLeave: 'Permesso', SickLeave: 'Malattia',
};

const ACCENTS = {
  Pending: (t: any) => t.kpiAmber,
  Approved: (t: any) => t.primary,
  Rejected: (t: any) => t.danger,
  Cancelled: (t: any) => t.border,
};

function initials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

function formatRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()} – ${e.getDate()} ${MONTHS[e.getMonth()]}`;
  }
  return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]}`;
}

function daysBetween(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

function badgeKind(status: VacationStatus) {
  if (status === 'Approved') return 'approved' as const;
  if (status === 'Pending') return 'pending' as const;
  return 'rejected' as const;
}

export default function VacationsScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<VacationStatus | null>(null);
  const [vacations, setVacations] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const textOnPri = textOnPrimary(t);

  const load = useCallback(async (status: VacationStatus | null) => {
    try {
      const data = await VacationService.getVacations(status ? { status } : undefined).catch(() => []);
      setVacations(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter]);
  const onRefresh = () => { setRefreshing(true); load(filter); };

  const handleApprove = async (id: number) => {
    try {
      await VacationService.approveVacation(id);
      setVacations(prev => prev.map(v => v.id === id ? { ...v, status: 'Approved' } : v));
    } catch (e) { Alert.alert('Errore', apiError(e)); }
  };

  const handleReject = async (id: number) => {
    try {
      await VacationService.rejectVacation(id);
      setVacations(prev => prev.map(v => v.id === id ? { ...v, status: 'Rejected' } : v));
    } catch (e) { Alert.alert('Errore', apiError(e)); }
  };

  const pendingCount = vacations.filter(v => v.status === 'Pending').length;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Ferie"
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
        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f, i) => {
            const label = f.value === 'Pending' && pendingCount > 0 ? `In attesa · ${pendingCount}` : f.label;
            return (
              <Chip key={i} t={t} label={label} active={filter === f.value} onPress={() => setFilter(f.value as any)} />
            );
          })}
        </ScrollView>

        {loading ? (
          <Text style={[styles.empty, { color: t.textSecondary }]}>Caricamento…</Text>
        ) : vacations.length === 0 ? (
          <Text style={[styles.empty, { color: t.textSecondary }]}>Nessuna richiesta</Text>
        ) : (
          vacations.map(v => {
            const accent = ACCENTS[v.status]?.(t) ?? t.border;
            const days = daysBetween(v.startDate, v.endDate);
            return (
              <Card key={v.id} t={t} padding={0} accent={accent}>
                <View style={styles.cardInner}>
                  <View style={styles.topRow}>
                    <Avatar t={t} initials={initials(v.employeeName)} size={40} />
                    <View style={styles.flex1}>
                      <Text style={[styles.empName, { color: t.text }]}>{v.employeeName}</Text>
                      <Text style={[styles.meta, { color: t.textSecondary }]}>
                        {TYPE_LABELS[v.type] ?? v.type} · {formatRange(v.startDate, v.endDate)}
                      </Text>
                      <Text style={[styles.days, { color: t.textSecondary }]}>
                        {days} {days === 1 ? 'giorno' : 'giorni'} lavorativi
                      </Text>
                    </View>
                    <StatusBadge t={t} kind={badgeKind(v.status)} />
                  </View>

                  {v.note && (
                    <View style={[styles.noteBanner, { backgroundColor: t.warningBg }]}>
                      <Text style={[styles.noteText, { color: t.warningText }]}>"{v.note}"</Text>
                    </View>
                  )}

                  {v.status === 'Pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={[styles.approveBtn, { backgroundColor: t.primary }]}
                        onPress={() => handleApprove(v.id)}>
                        <Icon name="check" size={14} color={textOnPri} strokeWidth={2.4} />
                        <Text style={[styles.actionTxt, { color: textOnPri }]}>Approva</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.rejectBtn, { borderColor: t.danger }]}
                        onPress={() => handleReject(v.id)}>
                        <Icon name="x" size={14} color={t.danger} strokeWidth={2.4} />
                        <Text style={[styles.actionTxt, { color: t.danger }]}>Rifiuta</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
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
  body: { padding: 14, gap: 10, paddingBottom: 32 },
  chips: { gap: 8, paddingBottom: 4 },
  empty: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, textAlign: 'center', padding: 24 },
  cardInner: { padding: 14, paddingLeft: 18, gap: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex1: { flex: 1, minWidth: 0 },
  empName: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  meta: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 1 },
  days: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 3 },
  noteBanner: { marginTop: 10, padding: 10, borderRadius: 10 },
  noteText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approveBtn: { flex: 1, height: 32, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rejectBtn: { flex: 1, height: 32, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12.5 },
});
