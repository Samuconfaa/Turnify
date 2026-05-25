import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { EmployeeTabLayout } from '@/components/EmployeeTabLayout';
import { Card, Icon, SectionLabel, SmallPill } from '@/components/ui';
import { ShiftService } from '@/services/shift.service';
import { AttendanceService } from '@/services/attendance.service';
import { apiError } from '@/services/api';
import { textOnPrimary } from '@/constants/tokens';
import type { Shift } from '@/types/shift.types';
import type { AttendanceLog } from '@/types/vacation.types';

function getMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function toISO(d: Date): string { return d.toISOString().split('T')[0]; }
function weekLabel(monday: Date): string {
  const end = addDays(monday, 6);
  if (monday.getMonth() === end.getMonth()) {
    return `${monday.getDate()}–${end.getDate()} ${monday.toLocaleString('it-IT', { month: 'short' })}`;
  }
  return `${monday.getDate()} ${monday.toLocaleString('it-IT', { month: 'short' })} – ${end.getDate()} ${end.toLocaleString('it-IT', { month: 'short' })}`;
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const DAY_ACCENTS = [null, null, null, null, null, '#B45309', null];

function fmtTime(iso: string): string { return iso.slice(11, 16); }
function dayAccent(d: Date, t: any): string {
  const dow = d.getDay();
  return dow === 6 ? '#B45309' : dow === 0 ? t.danger : t.kpiBlue;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function EmployeeShiftsScreen() {
  const { t } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const empId = user?.employeeId;
  const textOnPri = textOnPrimary(t);

  const [monday, setMonday] = useState<Date>(() => getMonday(new Date()));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [todayAtt, setTodayAtt] = useState<AttendanceLog | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const load = useCallback(async (mon: Date) => {
    if (!empId) { setRefreshing(false); return; }
    const startDate = toISO(mon);
    const endDate = toISO(addDays(mon, 6));
    const [data, att] = await Promise.all([
      ShiftService.getShifts({ employeeId: empId, startDate, endDate }).catch(() => [] as Shift[]),
      AttendanceService.getTodayAttendance(empId).catch(() => null),
    ]);
    setShifts(data);
    setTodayAtt(att);
    setRefreshing(false);
  }, [empId]);

  useEffect(() => { load(monday); }, [monday, load]);
  const onRefresh = () => { setRefreshing(true); load(monday); };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const att = await AttendanceService.checkIn();
      setTodayAtt(att);
    } catch (e) { Alert.alert('Errore', apiError(e)); }
    finally { setCheckingIn(false); }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      const att = await AttendanceService.checkOut();
      setTodayAtt(att);
    } catch (e) { Alert.alert('Errore', apiError(e)); }
    finally { setCheckingIn(false); }
  };

  const hasCheckedIn = !!todayAtt?.checkIn;
  const hasCheckedOut = !!todayAtt?.checkOut;
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const shiftForDay = (d: Date): Shift | undefined => {
    const iso = toISO(d);
    return shifts.find(s => s.startTime.startsWith(iso));
  };

  return (
    <EmployeeTabLayout>
      <View style={[styles.headerWrap, { paddingTop: insets.top + 8, backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <Text style={[styles.title, { color: t.text }]}>I tuoi turni</Text>
        <View style={styles.weekNav}>
          <TouchableOpacity style={[styles.navBtn, { borderColor: t.border, backgroundColor: t.surface }]}
            onPress={() => setMonday(m => addDays(m, -7))}>
            <Icon name="chev-l" size={16} color={t.text} strokeWidth={2} />
          </TouchableOpacity>
          <View style={[styles.weekLabel, { borderColor: t.border, backgroundColor: t.surface }]}>
            <Icon name="cal" size={14} color={t.primary} strokeWidth={2} />
            <Text style={[styles.weekLabelTxt, { color: t.text }]}>{weekLabel(monday)}</Text>
          </View>
          <TouchableOpacity style={[styles.navBtn, { borderColor: t.border, backgroundColor: t.surface }]}
            onPress={() => setMonday(m => addDays(m, 7))}>
            <Icon name="chev-r" size={16} color={t.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.todayBtn, { backgroundColor: t.primaryLight }]}
            onPress={() => setMonday(getMonday(new Date()))}>
            <Text style={[styles.todayTxt, { color: t.primary }]}>Oggi</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
      >
        {/* Live timbratura card */}
        <Card t={t} padding={16} style={{ backgroundColor: t.primaryLight, borderColor: 'transparent' }}>
          <View style={styles.liveRow}>
            <View style={[styles.liveDot, { backgroundColor: t.primary }]} />
            <View style={styles.flex1}>
              <Text style={[styles.liveStatus, { color: t.successText }]}>
                {hasCheckedIn ? (hasCheckedOut ? 'USCITO · ' + fmtTime(todayAtt!.checkOut!) : 'TURNO IN CORSO · entrato ' + fmtTime(todayAtt!.checkIn!)) : 'NESSUNA TIMBRATURA OGGI'}
              </Text>
              <Text style={[styles.liveShift, { color: t.text }]}>
                {shiftForDay(new Date())
                  ? `${shiftForDay(new Date())!.businessName} · fino alle ${fmtTime(shiftForDay(new Date())!.endTime)}`
                  : 'Nessun turno programmato'}
              </Text>
            </View>
          </View>
          <View style={styles.attBtns}>
            <TouchableOpacity
              style={[styles.attBtn, styles.attBtnFill, { backgroundColor: t.primary, opacity: hasCheckedIn ? 0.45 : 1 }]}
              onPress={handleCheckIn}
              disabled={hasCheckedIn || checkingIn}
            >
              <Icon name="check" size={16} color={textOnPri} strokeWidth={2.4} />
              <Text style={[styles.attBtnTxt, { color: textOnPri }]}>Timbra Entrata</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.attBtn, styles.attBtnOutline, { borderColor: t.primary, backgroundColor: t.surface, opacity: (!hasCheckedIn || hasCheckedOut) ? 0.45 : 1 }]}
              onPress={handleCheckOut}
              disabled={!hasCheckedIn || hasCheckedOut || checkingIn}
            >
              <Icon name="arrow-l" size={16} color={t.primary} strokeWidth={2.4} />
              <Text style={[styles.attBtnTxt, { color: t.primary }]}>Timbra Uscita</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <SectionLabel t={t} style={{ marginTop: 4 }}>Questa settimana</SectionLabel>

        {days.map((d, i) => {
          const shift = shiftForDay(d);
          const today = isToday(d);
          const isOff = !shift;
          const accent = shift ? (DAY_ACCENTS[i] ?? t.kpiBlue) : t.border;
          return (
            <Card key={i} t={t} padding={0} accent={accent}
              style={{ ...(today ? { borderColor: t.primary, borderWidth: 1.5 } : {}), opacity: isOff ? 0.7 : 1 }}>
              <View style={styles.dayRow}>
                <View style={styles.dayLabelWrap}>
                  <Text style={[styles.dayLabel, { color: t.text }]}>{DAY_LABELS[i]} {d.getDate()}</Text>
                  {today && <Text style={[styles.todayMark, { color: t.primary }]}>Oggi</Text>}
                </View>
                <View style={styles.flex1}>
                  <Text style={[styles.businessName, { color: isOff ? t.textSecondary : t.text }]}>
                    {shift ? shift.businessName : 'Riposo'}
                  </Text>
                  {shift && (
                    <Text style={[styles.shiftTime, { color: t.textSecondary }]}>
                      {fmtTime(shift.startTime)} – {fmtTime(shift.endTime)}
                    </Text>
                  )}
                </View>
                {shift && (
                  <SmallPill bg={t.surfaceLow} color={t.textSecondary} style={styles.tillPill}>
                    fino alle {fmtTime(shift.endTime)}
                  </SmallPill>
                )}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </EmployeeTabLayout>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 22, letterSpacing: -0.4, marginBottom: 12 },
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  weekLabel: { height: 32, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekLabelTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  todayBtn: { height: 32, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  todayTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  body: { padding: 16, gap: 12, paddingBottom: 32 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  flex1: { flex: 1 },
  liveStatus: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12, letterSpacing: 0.4 },
  liveShift: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15, marginTop: 2 },
  attBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
  attBtn: { flex: 1, height: 44, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  attBtnFill: {},
  attBtnOutline: { borderWidth: 1 },
  attBtnTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingLeft: 18 },
  dayLabelWrap: { width: 56 },
  dayLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  todayMark: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, marginTop: 2 },
  businessName: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  shiftTime: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 2 },
  tillPill: { height: 26, fontSize: 11 },
});
