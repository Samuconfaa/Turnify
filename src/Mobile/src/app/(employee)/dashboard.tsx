import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { EmployeeTabLayout } from '@/components/EmployeeTabLayout';
import { Card, Icon, SectionLabel, StatusBadge } from '@/components/ui';
import { ShiftService } from '@/services/shift.service';
import { AttendanceService } from '@/services/attendance.service';
import { EmployeeService } from '@/services/employee.service';
import type { Shift } from '@/types/shift.types';
import type { AttendanceLog } from '@/types/vacation.types';
import type { VacationBalance } from '@/types/employee.types';
import type { AttendanceSummary } from '@/services/attendance.service';

function fmtTime(iso: string): string {
  return iso.slice(11, 16);
}

function fmtShiftRange(shift: Shift): string {
  return `${fmtTime(shift.startTime)} – ${fmtTime(shift.endTime)}`;
}

function fmtDateLabel(iso: string): string {
  const d = new Date(iso);
  const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function shiftDurationH(shift: Shift): number {
  const start = new Date(shift.startTime).getTime();
  const end = new Date(shift.endTime).getTime();
  return Math.round((end - start) / 3600000);
}

export default function EmployeeDashboardScreen() {
  const { t } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = (user?.name ?? 'Ciao').split(' ')[0];
  const empId = user?.employeeId;

  const [nextShift, setNextShift] = useState<Shift | null>(null);
  const [todayAtt, setTodayAtt] = useState<AttendanceLog | null>(null);
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!empId) { setRefreshing(false); return; }
    const today = new Date().toISOString().split('T')[0];
    const [shifts, att, bal, sum] = await Promise.all([
      ShiftService.getShifts({ employeeId: empId, startDate: today, endDate: today }).catch(() => [] as Shift[]),
      AttendanceService.getTodayAttendance(empId).catch(() => null),
      EmployeeService.getVacationBalance(empId).catch(() => null),
      AttendanceService.getSummary(empId).catch(() => null),
    ]);
    setNextShift(shifts[0] ?? null);
    setTodayAtt(att);
    setBalance(bal);
    setSummary(sum);
    setRefreshing(false);
  }, [empId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const checkInTime = todayAtt?.checkIn ? fmtTime(todayAtt.checkIn) : '—';
  const checkOutTime = todayAtt?.checkOut ? fmtTime(todayAtt.checkOut) : '—';

  return (
    <EmployeeTabLayout>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <Text style={[styles.greeting, { color: t.text }]}>Ciao, {firstName} 👋</Text>
        <TouchableOpacity
          style={[styles.bellBtn, { backgroundColor: t.surfaceLow }]}
          onPress={() => router.push('/(employee)/notifications' as any)}
        >
          <Icon name="bell" size={20} color={t.text} strokeWidth={2} />
          <View style={[styles.bellDot, { backgroundColor: t.danger, borderColor: t.surface }]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
      >
        {/* Hero next shift */}
        <View style={[styles.heroCard, { backgroundColor: t.primary }]}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>PROSSIMO TURNO</Text>
            <StatusBadge t={t} kind="today" label="Oggi" />
          </View>
          {nextShift ? (
            <>
              <Text style={styles.heroTime}>{fmtShiftRange(nextShift)}</Text>
              <View style={styles.heroMeta}>
                <Text style={styles.heroMetaTxt}>{fmtDateLabel(nextShift.startTime)}</Text>
                <View style={styles.heroDot} />
                <Text style={styles.heroMetaTxt}>{shiftDurationH(nextShift)} ore</Text>
                <View style={styles.heroDot} />
                <Text style={styles.heroMetaTxt}>{nextShift.businessName}</Text>
              </View>
            </>
          ) : (
            <Text style={[styles.heroTime, { fontSize: 20 }]}>Nessun turno oggi</Text>
          )}
        </View>

        {/* Quick actions */}
        <View>
          <SectionLabel t={t}>Azioni rapide</SectionLabel>
          <View style={styles.quickGrid}>
            <TouchableOpacity style={[styles.quickTile, { backgroundColor: '#FFE8DA' }]}
              onPress={() => router.push('/(employee)/vacations' as any)}>
              <Icon name="palm" size={22} color="#9A3F0F" strokeWidth={2} />
              <Text style={[styles.quickLabel, { color: '#9A3F0F' }]}>{'Richiedi\nferie'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickTile, { backgroundColor: t.primaryLight }]}
              onPress={() => router.push('/(employee)/shifts' as any)}>
              <Icon name="clock" size={22} color={t.primary} strokeWidth={2} />
              <Text style={[styles.quickLabel, { color: t.primary }]}>Timbratura</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickTile, { backgroundColor: '#D4F1F4' }]}
              onPress={() => router.push('/(employee)/availability' as any)}>
              <Icon name="check" size={22} color="#0E7C7B" strokeWidth={2} />
              <Text style={[styles.quickLabel, { color: '#0E7C7B' }]}>{'Disponibi-\nlità'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timbratura oggi */}
        <View>
          <SectionLabel t={t}>Timbratura oggi</SectionLabel>
          <View style={styles.twoCol}>
            <View style={[styles.attCard, { backgroundColor: t.successBg }]}>
              <View style={styles.attRow}>
                <Icon name="arrow-r" size={14} color={t.successText} strokeWidth={2.2} />
                <Text style={[styles.attLabel, { color: t.successText }]}>ENTRATA</Text>
              </View>
              <Text style={[styles.attTime, { color: t.successText }]}>{checkInTime}</Text>
            </View>
            <View style={[styles.attCard, { backgroundColor: t.warningBg }]}>
              <View style={styles.attRow}>
                <Icon name="arrow-l" size={14} color={t.warningText} strokeWidth={2.2} />
                <Text style={[styles.attLabel, { color: t.warningText }]}>USCITA</Text>
              </View>
              <Text style={[styles.attTime, { color: t.warningText }]}>{checkOutTime}</Text>
            </View>
          </View>
        </View>

        {/* Ore riepilogo */}
        <View>
          <SectionLabel t={t}>Riepilogo ore</SectionLabel>
          <View style={styles.twoCol}>
            <Card t={t} padding={14} style={styles.flex1}>
              <Text style={[styles.kpiLabel, { color: t.textSecondary }]}>SETTIMANALI</Text>
              <View style={styles.kpiRow}>
                <Text style={[styles.kpiVal, { color: t.text }]}>{summary?.weekHours ?? 0}</Text>
                <Text style={[styles.kpiUnit, { color: t.textSecondary }]}>/ {summary?.weekTarget ?? 40}h</Text>
              </View>
              <View style={[styles.bar, { backgroundColor: t.surfaceLow }]}>
                <View style={[styles.barFill, { backgroundColor: t.primary, width: `${Math.min(100, ((summary?.weekHours ?? 0) / (summary?.weekTarget ?? 40)) * 100)}%` as any }]} />
              </View>
            </Card>
            <Card t={t} padding={14} style={styles.flex1}>
              <Text style={[styles.kpiLabel, { color: t.textSecondary }]}>MENSILI</Text>
              <View style={styles.kpiRow}>
                <Text style={[styles.kpiVal, { color: t.text }]}>{summary?.monthHours ?? 0}</Text>
                <Text style={[styles.kpiUnit, { color: t.textSecondary }]}>/ {summary?.monthTarget ?? 160}h</Text>
              </View>
              <View style={[styles.bar, { backgroundColor: t.surfaceLow }]}>
                <View style={[styles.barFill, { backgroundColor: t.primary, width: `${Math.min(100, ((summary?.monthHours ?? 0) / (summary?.monthTarget ?? 160)) * 100)}%` as any }]} />
              </View>
            </Card>
          </View>
        </View>

        {/* Ferie rimanenti */}
        <Card t={t} padding={16}>
          <View style={styles.leaveRow}>
            <View style={[styles.leaveIcon, { backgroundColor: t.primaryLight }]}>
              <Icon name="palm" size={22} color={t.primary} strokeWidth={2} />
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.leaveTitle, { color: t.text }]}>Ferie rimanenti</Text>
              <View style={styles.leaveValRow}>
                <Text style={[styles.leaveVal, { color: t.primary }]}>{balance?.remainingDays ?? 0}</Text>
                <Text style={[styles.leaveSub, { color: t.textSecondary }]}>su {balance?.totalDays ?? 0} giorni · {balance?.usedDays ?? 0} usati</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/(employee)/vacations' as any)}>
              <Text style={[styles.leaveLink, { color: t.primary }]}>Vedi tutte ›</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <TouchableOpacity onPress={() => router.push('/(employee)/attendance' as any)}>
          <Text style={[styles.attendanceLink, { color: t.primary }]}>Storico presenze →</Text>
        </TouchableOpacity>
      </ScrollView>
    </EmployeeTabLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1,
  },
  greeting: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 22, letterSpacing: -0.4 },
  bellBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, borderWidth: 2 },
  body: { padding: 16, gap: 20, paddingBottom: 32 },
  heroCard: { borderRadius: 20, padding: 20 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  heroLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, letterSpacing: 0.8, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' },
  heroTime: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 38, color: '#fff', letterSpacing: -1.2, lineHeight: 42 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14 },
  heroMetaTxt: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, color: 'rgba(255,255,255,0.92)' },
  heroDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.6)' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickTile: { flex: 1, borderRadius: 14, padding: 14, gap: 10 },
  quickLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12, lineHeight: 15 },
  twoCol: { flexDirection: 'row', gap: 10 },
  attCard: { flex: 1, borderRadius: 14, padding: 14 },
  attRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  attLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, letterSpacing: 0.4 },
  attTime: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, letterSpacing: -0.4 },
  flex1: { flex: 1 },
  kpiLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, letterSpacing: 0.4 },
  kpiRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 },
  kpiVal: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 26, letterSpacing: -0.6 },
  kpiUnit: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14 },
  bar: { height: 4, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  leaveRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  leaveIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  leaveTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  leaveValRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  leaveVal: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, letterSpacing: -0.4 },
  leaveSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
  leaveLink: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  attendanceLink: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13, textAlign: 'center', paddingBottom: 8 },
});
