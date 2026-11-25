import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, Card, Icon, KPI, SectionLabel, StatusBadge } from '@/components/ui';
import { AdminTabLayout } from '@/components/AdminTabLayout';
import { ShiftService } from '@/services/shift.service';
import { api, apiError } from '@/services/api';
import { textOnPrimary } from '@/constants/tokens';
import type { Shift } from '@/types/shift.types';
import type { VacationRequest } from '@/types/vacation.types';

const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const DAY_SHORTS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function weekRangeLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  return `Settimana del ${monday.getDate()} – ${sunday.getDate()} ${MONTHS[sunday.getMonth()]}`;
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function daysBetween(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(diff / 86400000) + 1;
}

function coverageKind(n: number): 'ok' | 'part' | 'empty' {
  if (n === 0) return 'empty';
  if (n < 3) return 'part';
  return 'ok';
}

export default function AdminDashboard() {
  const { t, dark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const covCellW = Math.floor((screenW - 40 - 6 * 8) / 7); // 40=padding*2, 48=6 gaps

  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [pending, setPending] = useState<VacationRequest[]>([]);
  const [coverage, setCoverage] = useState<Array<{ date: string; day: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const monday = getMonday(today);
  const textOnPri = textOnPrimary(t);

  const covBg = { ok: t.successBg, part: t.warningBg, empty: t.errorBg };
  const covFg = { ok: t.successText, part: t.warningText, empty: t.errorText };

  const load = useCallback(async () => {
    try {
      const todayStr = toISO(today);
      const mondayStr = toISO(monday);
      const sundayStr = toISO(addDays(monday, 6));

      const [todShifts, wkShifts, vacations, cov] = await Promise.all([
        ShiftService.getShifts({ startDate: todayStr, endDate: todayStr }).catch(() => [] as Shift[]),
        ShiftService.getShifts({ startDate: mondayStr, endDate: sundayStr }).catch(() => [] as Shift[]),
        api.get<unknown>('/api/vacation-requests', { params: { status: 'Pending' } }).then(r => Array.isArray(r.data) ? r.data as VacationRequest[] : []).catch(() => [] as VacationRequest[]),
        ShiftService.getWeekCoverage(mondayStr).catch(() => []),
      ]);

      setTodayShifts(todShifts);
      setPending(vacations);

      if (cov.length > 0) {
        setCoverage(cov.map((c, i) => ({ date: c.date, day: DAY_SHORTS[i] ?? c.dayName, count: c.shiftsCount })));
      } else {
        const counts = Array(7).fill(0) as number[];
        wkShifts.forEach(s => {
          const diff = Math.floor((new Date(s.startTime).getTime() - monday.getTime()) / 86400000);
          if (diff >= 0 && diff < 7) counts[diff]++;
        });
        setCoverage(Array.from({ length: 7 }, (_, i) => ({
          date: toISO(addDays(monday, i)),
          day: DAY_SHORTS[i]!,
          count: counts[i]!,
        })));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleApprove = async (id: number) => {
    try {
      await api.patch(`/api/vacation-requests/${id}/approve`);
      setPending(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      Alert.alert('Errore', apiError(e));
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.patch(`/api/vacation-requests/${id}/reject`);
      setPending(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      Alert.alert('Errore', apiError(e));
    }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';

  return (
    <AdminTabLayout>
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.surface, borderColor: t.border, paddingTop: insets.top + 8 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { color: t.text }]}>{greeting}, {firstName}</Text>
              <Text style={[styles.week, { color: t.textSecondary }]}>{weekRangeLabel(monday)}</Text>
            </View>
            <View style={[styles.bellBox, { backgroundColor: t.surfaceLow }]}>
              <Icon name="bell" size={20} color={t.text} />
              <View style={[styles.redDot, { borderColor: t.surface }]} />
            </View>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
        >
          {/* KPIs */}
          <View style={styles.kpiGrid}>
            <KPI label="In turno oggi" value={todayShifts.length} icon="users" bg={t.primary} fg={textOnPri} dark={dark} />
            <KPI label="Ferie in attesa" value={pending.length} icon="palm" bg={t.danger} fg="#FFF" dark={dark} />
            <KPI label="Ore totali" value="—" icon="clock" bg={t.kpiBlue} fg="#FFF" dark={dark} />
          </View>

          {/* Turni oggi */}
          <View>
            <SectionLabel t={t} action="Vedi tutti">Turni oggi</SectionLabel>
            {todayShifts.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: t.surface, borderColor: t.border }]}>
                <Text style={[styles.emptyTxt, { color: t.textSecondary }]}>
                  {loading ? 'Caricamento…' : 'Nessun turno oggi'}
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {todayShifts.map(s => (
                  <Card key={s.id} t={t} padding={14}>
                    <View style={styles.shiftRow}>
                      <Avatar t={t} initials={initials(s.employeeName)} size={40} />
                      <View style={styles.flex1}>
                        <Text style={[styles.name, { color: t.text }]}>{s.employeeName}</Text>
                        <Text style={[styles.time, { color: t.textSecondary }]}>
                          {formatTime(s.startTime)} – {formatTime(s.endTime)}
                        </Text>
                      </View>
                      <StatusBadge t={t} kind={s.status === 'InProgress' ? 'today' : 'approved'} />
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>

          {/* Ferie in attesa */}
          {(pending.length > 0 || !loading) && (
            <View>
              <SectionLabel t={t} action={pending.length > 0 ? `Tutte (${pending.length})` : undefined}>
                Ferie in attesa
              </SectionLabel>
              {pending.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: t.surface, borderColor: t.border }]}>
                  <Text style={[styles.emptyTxt, { color: t.textSecondary }]}>Nessuna richiesta in attesa</Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {pending.slice(0, 3).map(v => (
                    <Card key={v.id} t={t} padding={14}>
                      <View style={styles.shiftRow}>
                        <Avatar t={t} initials={initials(v.employeeName)} size={40} bg={t.warningBg} color={t.warningText} />
                        <View style={styles.flex1}>
                          <Text style={[styles.name, { color: t.text }]}>{v.employeeName}</Text>
                          <Text style={[styles.time, { color: t.textSecondary }]}>
                            Ferie · {v.startDate.slice(5).replace('-', '/')} – {v.endDate.slice(5).replace('-', '/')} · {daysBetween(v.startDate, v.endDate)} gg
                          </Text>
                        </View>
                        <StatusBadge t={t} kind="pending" />
                      </View>
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.approveBtn, { backgroundColor: t.primary }]}
                          onPress={() => handleApprove(v.id)}
                        >
                          <Icon name="check" size={14} color={textOnPri} strokeWidth={2.4} />
                          <Text style={[styles.actionTxt, { color: textOnPri }]}>Approva</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.rejectBtn, { borderColor: t.danger }]}
                          onPress={() => handleReject(v.id)}
                        >
                          <Icon name="x" size={14} color={t.danger} strokeWidth={2.4} />
                          <Text style={[styles.actionTxt, { color: t.danger }]}>Rifiuta</Text>
                        </TouchableOpacity>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Copertura settimana */}
          <View>
            <SectionLabel t={t}>Copertura settimana</SectionLabel>
            {coverage.length === 0 ? (
              <Text style={[styles.emptyTxt, { color: t.textSecondary }]}>
                {loading ? 'Caricamento…' : 'Nessun dato'}
              </Text>
            ) : (
              <View style={styles.covRow}>
                {coverage.map((c, i) => {
                  const kind = coverageKind(c.count);
                  const isToday = c.date === toISO(today);
                  return (
                    <View
                      key={i}
                      style={[
                        styles.covCell,
                        {
                          width: covCellW,
                          backgroundColor: covBg[kind],
                          borderColor: isToday ? t.primary : dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                          borderWidth: isToday ? 2 : 1,
                        },
                      ]}
                    >
                      <Text style={[styles.covDay, { color: covFg[kind] }]}>{c.day}</Text>
                      <Text style={[styles.covCount, { color: covFg[kind] }]}>{c.count}</Text>
                      <View style={[styles.covDot, { backgroundColor: covFg[kind] }]} />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </AdminTabLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 22, letterSpacing: -0.4, lineHeight: 28 },
  week: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 2 },
  bellBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  redDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#BA1A1A', borderWidth: 2,
  },
  scroll: { padding: 20, gap: 20, paddingBottom: 8 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  list: { gap: 10 },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex1: { flex: 1, minWidth: 0 },
  name: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  time: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approveBtn: {
    flex: 1, height: 36, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  rejectBtn: {
    flex: 1, height: 36, borderRadius: 10, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  actionTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  covRow: { flexDirection: 'row', gap: 8 },
  covCell: { height: 80, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 4 },
  covDay: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, letterSpacing: 0.3, opacity: 0.85 },
  covCount: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, letterSpacing: -0.4 },
  covDot: { width: 6, height: 6, borderRadius: 3, opacity: 0.7 },
  emptyCard: { borderRadius: 14, padding: 20, borderWidth: 1, alignItems: 'center' },
  emptyTxt: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13 },
});
