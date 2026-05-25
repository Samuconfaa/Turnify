import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Card, Header, Icon, SectionLabel } from '@/components/ui';
import { AttendanceService } from '@/services/attendance.service';
import type { AttendanceLog } from '@/types/vacation.types';

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const SHORT_DAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

function fmtDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${SHORT_DAYS[d.getDay()]} ${d.getDate()}`;
}

function fmtTime(iso: string): string { return iso.slice(11, 16); }

function fmtHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export default function AttendanceScreen() {
  const { t } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const empId = user?.employeeId;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (y: number, m: number) => {
    if (!empId) { setLoading(false); return; }
    const data = await AttendanceService.getHistory(empId, { year: y, month: m + 1 }).catch(() => []);
    setLogs(data);
    setLoading(false);
    setRefreshing(false);
  }, [empId]);

  useEffect(() => { load(year, month); }, [year, month, load]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else { setMonth(m => m - 1); }
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else { setMonth(m => m + 1); }
  };

  const daysWorked = logs.filter(l => l.hoursWorked && l.hoursWorked > 0).length;
  const totalMinutes = logs.reduce((acc, l) => acc + (l.hoursWorked ? Math.round(l.hoursWorked * 60) : 0), 0);
  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Storico presenze"
          leading={
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="chev-l" size={20} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
          }
        />
      </View>

      <View style={styles.monthNav}>
        <TouchableOpacity style={[styles.monthNavBtn, { borderColor: t.border, backgroundColor: t.surface }]} onPress={prevMonth}>
          <Icon name="chev-l" size={18} color={t.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: t.text }]}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity style={[styles.monthNavBtn, { borderColor: t.border, backgroundColor: t.surface }]} onPress={nextMonth}>
          <Icon name="chev-r" size={18} color={t.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <Card t={t} padding={14} style={styles.flex1}>
          <Text style={[styles.statLabel, { color: t.textSecondary }]}>GIORNI LAVORATI</Text>
          <Text style={[styles.statVal, { color: t.text }]}>{daysWorked}</Text>
        </Card>
        <Card t={t} padding={14} style={styles.flex1}>
          <Text style={[styles.statLabel, { color: t.textSecondary }]}>ORE TOTALI</Text>
          <View style={styles.statHoursRow}>
            <Text style={[styles.statVal, { color: t.text }]}>{totalH}</Text>
            <Text style={[styles.statHoursSub, { color: t.textSecondary }]}>h {totalM.toString().padStart(2, '0')}m</Text>
          </View>
        </Card>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator color={t.primary} /></View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(year, month); }} tintColor={t.primary} />}
        >
          <SectionLabel t={t}>Registro giornaliero</SectionLabel>
          {logs.length === 0 ? (
            <Text style={[styles.empty, { color: t.textSecondary }]}>Nessuna presenza registrata</Text>
          ) : (
            logs.map((log, i) => {
              const isLeave = !log.checkIn;
              const checkIn = log.checkIn ? fmtTime(log.checkIn) : '—';
              const checkOut = log.checkOut ? fmtTime(log.checkOut) : '—';
              const hoursLabel = log.hoursWorked
                ? fmtHours(Math.round(log.hoursWorked * 60))
                : isLeave ? 'Ferie' : '—';
              return (
                <View key={log.id} style={[styles.logRow, { backgroundColor: t.surface, borderColor: t.border }]}>
                  <View style={[styles.logIcon, {
                    backgroundColor: isLeave ? t.warningBg : t.primaryLight,
                  }]}>
                    <Icon
                      name={isLeave ? 'palm' : 'check'}
                      size={16}
                      color={isLeave ? t.warningText : t.primary}
                      strokeWidth={2.4}
                    />
                  </View>
                  <View style={styles.logDay}>
                    <Text style={[styles.logDayLabel, { color: t.text }]}>{fmtDayLabel(log.date)}</Text>
                  </View>
                  <View style={styles.logTimes}>
                    <Text style={[styles.logTime, { color: log.checkIn ? t.text : t.textSecondary }]}>{checkIn}</Text>
                    <Icon name="arrow-r" size={10} color={t.textSecondary} strokeWidth={2} />
                    <Text style={[styles.logTime, { color: log.checkOut ? t.text : t.textSecondary }]}>{checkOut}</Text>
                  </View>
                  <Text style={[styles.logHours, { color: isLeave ? t.warningText : t.text }]}>{hoursLabel}</Text>
                </View>
              );
            })
          )}
          <Text style={[styles.loadMore, { color: t.textSecondary }]}>Carica altri giorni…</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' as any, paddingHorizontal: 16, paddingVertical: 10 },
  monthNavBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 4 },
  flex1: { flex: 1 },
  statLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, letterSpacing: 0.4 },
  statVal: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, letterSpacing: -0.6, marginTop: 4 },
  statHoursRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  statHoursSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 6, paddingBottom: 32 },
  empty: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  logRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, paddingHorizontal: 14, borderWidth: 1, borderRadius: 12,
  },
  logIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logDay: { width: 70 },
  logDayLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13.5 },
  logTimes: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  logTime: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 13 },
  logHours: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 13, letterSpacing: -0.2 },
  loadMore: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, textAlign: 'center', paddingVertical: 14 },
});
