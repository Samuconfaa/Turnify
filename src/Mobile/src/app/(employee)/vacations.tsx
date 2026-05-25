import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { EmployeeTabLayout } from '@/components/EmployeeTabLayout';
import { Card, Chip, Header, Icon, StatusBadge } from '@/components/ui';
import { VacationService } from '@/services/vacation.service';
import { textOnPrimary } from '@/constants/tokens';
import type { VacationRequest, VacationStatus } from '@/types/vacation.types';

type FilterType = 'all' | VacationStatus;

const FILTERS: Array<{ label: string; value: FilterType }> = [
  { label: 'Tutte', value: 'all' },
  { label: 'In attesa', value: 'Pending' },
  { label: 'Approvate', value: 'Approved' },
  { label: 'Rifiutate', value: 'Rejected' },
];

const TYPE_LABELS: Record<string, string> = {
  Holiday: 'Ferie',
  PaidLeave: 'Permesso',
  UnpaidLeave: 'Permesso non retr.',
  SickLeave: 'Malattia',
};

function accentForStatus(status: VacationStatus, t: any): string {
  if (status === 'Approved') return t.primary;
  if (status === 'Rejected' || status === 'Cancelled') return t.danger;
  return t.kpiAmber;
}

function statusKind(s: VacationStatus): 'approved' | 'pending' | 'rejected' | 'cancelled' {
  if (s === 'Approved') return 'approved';
  if (s === 'Rejected') return 'rejected';
  if (s === 'Cancelled') return 'cancelled';
  return 'pending';
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString('it-IT', { month: 'short' })} ${d.getFullYear()}`;
}

function daysBetween(from: string, to: string): number {
  const msPerDay = 86400000;
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / msPerDay) + 1;
}

export default function EmployeeVacationsScreen() {
  const { t } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const textOnPri = textOnPrimary(t);
  const empId = user?.employeeId;

  const [filter, setFilter] = useState<FilterType>('all');
  const [vacations, setVacations] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (f: FilterType) => {
    const params: any = { employeeId: empId };
    if (f !== 'all') params.status = f;
    const data = await VacationService.getVacations(params).catch(() => []);
    setVacations(data);
    setLoading(false);
    setRefreshing(false);
  }, [empId]);

  useEffect(() => { load(filter); }, [filter, load]);
  const onRefresh = () => { setRefreshing(true); load(filter); };

  return (
    <EmployeeTabLayout>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Ferie"
          trailing={
            <TouchableOpacity
              style={[styles.requestBtn, { backgroundColor: t.primary }]}
              onPress={() => router.push('/(employee)/vacations/new' as any)}
            >
              <Icon name="plus" size={16} color={textOnPri} strokeWidth={2.2} />
              <Text style={[styles.requestBtnTxt, { color: textOnPri }]}>Richiedi</Text>
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
        ) : vacations.length === 0 ? (
          <Text style={[styles.empty, { color: t.textSecondary }]}>Nessuna richiesta trovata</Text>
        ) : (
          vacations.map(v => {
            const days = daysBetween(v.startDate, v.endDate);
            return (
              <Card key={v.id} t={t} padding={0} accent={accentForStatus(v.status, t)}>
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={styles.flex1}>
                      <Text style={[styles.typeText, { color: t.text }]}>
                        {TYPE_LABELS[v.type] ?? v.type} · {fmtDate(v.startDate)}
                        {v.startDate !== v.endDate ? ` – ${fmtDate(v.endDate)}` : ''}
                      </Text>
                      <Text style={[styles.daysText, { color: t.textSecondary }]}>
                        {days} {days === 1 ? 'giorno' : 'giorni'} lavorativi
                      </Text>
                    </View>
                    <StatusBadge t={t} kind={statusKind(v.status)} />
                  </View>
                  {v.note && (
                    <View style={[styles.noteBanner, { backgroundColor: t.warningBg }]}>
                      <Text style={[styles.noteText, { color: t.warningText }]}>"{v.note}"</Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </EmployeeTabLayout>
  );
}

const styles = StyleSheet.create({
  requestBtn: { height: 36, paddingHorizontal: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  requestBtnTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  body: { padding: 16, gap: 10, paddingBottom: 32 },
  chips: { gap: 8, paddingBottom: 4 },
  empty: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, textAlign: 'center', padding: 24 },
  cardBody: { padding: 14, paddingLeft: 18, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex1: { flex: 1, minWidth: 0 },
  typeText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  daysText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 4 },
  noteBanner: { borderRadius: 10, padding: 8 },
  noteText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, fontStyle: 'italic' },
});
