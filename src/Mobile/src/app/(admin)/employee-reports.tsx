import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, Card, Header, Icon, Input } from '@/components/ui';
import { ReportService } from '@/services/report.service';
import type { EmployeeHoursReport } from '@/services/report.service';

function initials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

export default function EmployeeReportsScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  const now = new Date();
  const [from, setFrom] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
  const [to, setTo] = useState((() => {
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${last}`;
  })());
  const [group, setGroup] = useState('Mese');
  const [reports, setReports] = useState<EmployeeHoursReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const load = useCallback(async () => {
    const data = await ReportService.getEmployeeHoursReport(from, to).catch(() => []);
    setReports(data);
    setLoading(false);
    setRefreshing(false);
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const totalHours = reports.reduce((acc, r) => acc + r.totalHours, 0);

  const toggleExpand = (idx: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Report ore"
          leading={
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="chev-l" size={20} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
          }
          trailing={
            <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: t.primaryLight }]}>
              <Icon name="download" size={18} color={t.primary} strokeWidth={2} />
            </TouchableOpacity>
          }
        />
      </View>

      <View style={styles.filters}>
        <View style={styles.flex1}>
          <Input t={t} label="Dal" value={from} onChangeText={setFrom} leadingIcon="cal" />
        </View>
        <View style={styles.flex1}>
          <Input t={t} label="Al" value={to} onChangeText={setTo} leadingIcon="cal" />
        </View>
        <View style={styles.flex1}>
          <Input t={t} label="Raggruppa" value={group} onChangeText={setGroup} trailingIcon="chev-d" />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator color={t.primary} /></View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={t.primary} />}
        >
          <Card t={t} padding={14} style={{ backgroundColor: t.primaryLight, borderColor: 'transparent' }}>
            <Text style={[styles.teamLabel, { color: t.successText }]}>TOTALE TEAM</Text>
            <View style={styles.teamValRow}>
              <Text style={[styles.teamVal, { color: t.successText }]}>{totalHours}</Text>
              <Text style={[styles.teamSub, { color: t.successText }]}>
                ore · {reports.length} dipendenti
              </Text>
            </View>
          </Card>

          {reports.map((p, i) => {
            const isExpanded = expanded.has(i);
            const diff = p.totalHours - p.plannedHours;
            return (
              <Card key={p.employeeId} t={t} padding={0}>
                <TouchableOpacity
                  style={styles.empRow}
                  onPress={() => toggleExpand(i)}
                  activeOpacity={0.8}
                >
                  <Avatar t={t} initials={p.initials || initials(p.employeeName)} size={40} />
                  <View style={styles.flex1}>
                    <Text style={[styles.empName, { color: t.text }]}>{p.employeeName}</Text>
                    <Text style={[styles.empPlan, { color: t.textSecondary }]}>su {p.plannedHours} ore previste</Text>
                  </View>
                  <View style={styles.empHoursWrap}>
                    <Text style={[styles.empHours, { color: t.text }]}>
                      {p.totalHours}<Text style={[styles.empHoursUnit, { color: t.textSecondary }]}>h</Text>
                    </Text>
                    <Text style={[styles.empDiff, { color: diff >= 0 ? t.primary : t.warningText }]}>
                      {diff >= 0 ? '+' : ''}{diff}h
                    </Text>
                  </View>
                  <Icon name={isExpanded ? 'chev-d' : 'chev-r'} size={18} color={t.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
                {isExpanded && p.weeks && p.weeks.length > 0 && (
                  <View style={[styles.weekList, { borderTopColor: t.borderSoft }]}>
                    {p.weeks.map((w, j) => (
                      <View
                        key={j}
                        style={[styles.weekRow, j < p.weeks.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.borderSoft }]}
                      >
                        <Text style={[styles.weekLabel, { color: t.textSecondary }]}>{w.label}</Text>
                        <View style={styles.weekBarWrap}>
                          <View style={[styles.weekBarBg, { backgroundColor: t.surfaceLow }]}>
                            <View style={[styles.weekBarFill, { backgroundColor: t.primary, width: `${Math.min(100, (w.hours / 48) * 100)}%` as any }]} />
                          </View>
                          <Text style={[styles.weekHours, { color: t.text }]}>{w.hours}h</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            );
          })}

          {reports.length === 0 && (
            <Text style={[styles.empty, { color: t.textSecondary }]}>Nessun dato disponibile</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  downloadBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  flex1: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, paddingTop: 4, gap: 10, paddingBottom: 32 },
  teamLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, letterSpacing: 0.4 },
  teamValRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  teamVal: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 26, letterSpacing: -0.6 },
  teamSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12.5, opacity: 0.85 },
  empRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  empName: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  empPlan: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 2 },
  empHoursWrap: { alignItems: 'flex-end' },
  empHours: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, letterSpacing: -0.3 },
  empHoursUnit: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 12 },
  empDiff: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 10, marginTop: 2 },
  weekList: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1 },
  weekRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 4 },
  weekLabel: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13 },
  weekBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weekBarBg: { width: 80, height: 4, borderRadius: 2, overflow: 'hidden' },
  weekBarFill: { height: '100%', borderRadius: 2 },
  weekHours: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13, minWidth: 30, textAlign: 'right' },
  empty: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, textAlign: 'center', paddingVertical: 24 },
});
