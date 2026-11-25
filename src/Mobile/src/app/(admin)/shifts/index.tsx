import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, Icon } from '@/components/ui';
import { AdminTabLayout } from '@/components/AdminTabLayout';
import { ShiftService } from '@/services/shift.service';
import type { Shift } from '@/types/shift.types';

const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const DAY_HEADS = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
const DAY_COLORS_IDX = [null, null, null, null, null, '#B45309', null] as const;

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

function weekLabel(monday: Date): string {
  const sun = addDays(monday, 6);
  return `${monday.getDate()} – ${sun.getDate()} ${MONTHS[sun.getMonth()]}`;
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

function formatCell(startISO: string, endISO: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };
  return `${fmt(startISO)}–${fmt(endISO)}`;
}

interface EmployeeRow {
  id: number;
  name: string;
  inits: string;
  cells: (Shift | 'FERIE' | null)[];
}

export default function ShiftsAdmin() {
  const { t, dark } = useTheme();
  const insets = useSafeAreaInsets();

  const [monday, setMonday] = useState<Date>(getMonday(new Date()));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (mon: Date) => {
    try {
      const data = await ShiftService.getShifts({
        startDate: toISO(mon),
        endDate: toISO(addDays(mon, 6)),
      }).catch(() => [] as Shift[]);
      setShifts(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(monday); }, [monday]);

  const prevWeek = () => setMonday(m => addDays(m, -7));
  const nextWeek = () => setMonday(m => addDays(m, 7));
  const goToday = () => setMonday(getMonday(new Date()));
  const onRefresh = () => { setRefreshing(true); load(monday); };

  // Build employee grid rows from shifts
  const employeeMap = new Map<number, EmployeeRow>();
  shifts.forEach(s => {
    if (!employeeMap.has(s.employeeId)) {
      employeeMap.set(s.employeeId, {
        id: s.employeeId,
        name: s.employeeName,
        inits: initials(s.employeeName),
        cells: Array(7).fill(null),
      });
    }
    const dayDiff = Math.floor(
      (new Date(s.startTime).getTime() - monday.getTime()) / 86400000,
    );
    if (dayDiff >= 0 && dayDiff < 7) {
      const row = employeeMap.get(s.employeeId)!;
      row.cells[dayDiff] = s;
    }
  });
  const rows = Array.from(employeeMap.values());

  // Shift color based on start hour
  function cellColor(s: Shift | 'FERIE'): { bg: string; fg: string } {
    if (s === 'FERIE') return { bg: t.warningBg, fg: t.warningText };
    const hour = new Date(s.startTime).getHours();
    if (hour < 9) return { bg: t.kpiBlueBg, fg: t.kpiBlue };
    if (hour < 13) return { bg: t.primaryLight, fg: t.primary };
    if (hour < 17) return { bg: dark ? '#2E2611' : '#FEF9C3', fg: t.kpiAmber };
    return { bg: dark ? '#2A1F30' : '#EEE5F7', fg: dark ? '#C49BFF' : '#6D28D9' };
  }

  const { width: screenW } = useWindowDimensions();
  const AVATAR_W = 0;
  const PADDING = 32;  // 16+16
  const GAP = 4;
  const CELL_W = Math.floor((screenW - PADDING - AVATAR_W - 6 * GAP) / 7);

  return (
    <AdminTabLayout>
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.surface, borderColor: t.border, paddingTop: insets.top + 8 }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: t.text }]}>Turni</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.surfaceLow }]}>
                <Icon name="filter" size={18} color={t.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: t.primary }]}
                onPress={() => router.push('/(admin)/shifts/new' as any)}
              >
                <Icon name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          {/* WeekNav */}
          <View style={styles.weekNav}>
            <TouchableOpacity style={[styles.navBtn, { borderColor: t.border, backgroundColor: t.surface }]} onPress={prevWeek}>
              <Icon name="chev-l" size={16} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navLabel, { borderColor: t.border, backgroundColor: t.surface }]}>
              <Icon name="cal" size={14} color={t.primary} strokeWidth={2} />
              <Text style={[styles.navLabelTxt, { color: t.text }]}>{weekLabel(monday)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navBtn, { borderColor: t.border, backgroundColor: t.surface }]} onPress={nextWeek}>
              <Icon name="chev-r" size={16} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.todayBtn, { backgroundColor: t.primaryLight }]} onPress={goToday}>
              <Text style={[styles.todayTxt, { color: t.primary }]}>Oggi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Grid */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
        >
          <View style={styles.gridContainer}>
            {/* Day headers */}
            <View style={[styles.gridRow, { marginBottom: 8 }]}>
              {DAY_HEADS.map((d, i) => (
                <View key={i} style={{ width: CELL_W, alignItems: 'center' }}>
                  <Text style={[
                    styles.dayHead,
                    { color: DAY_COLORS_IDX[i] ?? t.textSecondary },
                  ]}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Employee rows */}
            {loading && rows.length === 0 ? (
              <Text style={[styles.emptyTxt, { color: t.textSecondary, paddingVertical: 24, textAlign: 'center' }]}>Caricamento…</Text>
            ) : rows.length === 0 ? (
              <Text style={[styles.emptyTxt, { color: t.textSecondary, paddingVertical: 24, textAlign: 'center' }]}>Nessun turno in questa settimana</Text>
            ) : (
              <View style={{ gap: 6 }}>
                {rows.map(emp => (
                  <View key={emp.id} style={styles.gridRow}>
                    <Avatar t={t} initials={emp.inits} size={20} />
                    {emp.cells.map((cell, i) => {
                      if (!cell) {
                        return (
                          <TouchableOpacity
                            key={i}
                            style={[styles.cell, { width: CELL_W, backgroundColor: t.surfaceLow, borderColor: t.border, borderStyle: 'dashed', borderWidth: 1 }]}
                            onPress={() => router.push('/(admin)/shifts/new' as any)}
                          />
                        );
                      }
                      const c = cellColor(cell);
                      const label = cell === 'FERIE' ? 'FERIE' : formatCell(cell.startTime, cell.endTime);
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[styles.cell, { width: CELL_W, backgroundColor: c.bg }]}
                          onPress={() => cell !== 'FERIE' && router.push(`/(admin)/shifts/${cell.id}` as any)}
                        >
                          <Text style={[styles.cellTxt, { color: c.fg }]} numberOfLines={2}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}

            {/* Legend */}
            <View style={styles.legend}>
              {[
                { color: t.primary, label: 'Mattina' },
                { color: t.kpiAmber, label: 'Pomeriggio' },
                { color: dark ? '#C49BFF' : '#6D28D9', label: 'Sera' },
                { color: t.warningText, label: 'Ferie' },
              ].map((l, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                  <Text style={[styles.legendTxt, { color: t.textSecondary }]}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </AdminTabLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 22, letterSpacing: -0.4 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: {
    width: 32, height: 32, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  navLabel: {
    height: 32, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  navLabelTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  todayBtn: {
    height: 32, paddingHorizontal: 12, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginLeft: 'auto',
  },
  todayTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  gridContainer: { padding: 16, paddingBottom: 8 },
  gridRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dayHead: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 10.5, letterSpacing: 0.8, textAlign: 'center' },
  empCol: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  empName: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, flex: 1 },
  cell: {
    height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    padding: 3,
  },
  cellTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 9.5, textAlign: 'center', lineHeight: 13 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11 },
  emptyTxt: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, textAlign: 'center' },
});
