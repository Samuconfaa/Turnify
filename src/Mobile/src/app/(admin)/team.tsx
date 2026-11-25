import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, Card, Chip, Header, Icon, Input, SmallPill, StatusBadge } from '@/components/ui';
import { AdminTabLayout } from '@/components/AdminTabLayout';
import { EmployeeService } from '@/services/employee.service';
import type { Employee } from '@/types/employee.types';

const CONTRACT_LABELS: Record<string, string> = {
  FullTime: 'Full-time', PartTime: 'Part-time', Freelance: 'Freelance', Internship: 'Stage',
};

function initials(name?: string): string {
  if (!name) return '';
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

export default function TeamScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [activeBusiness, setActiveBusiness] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await EmployeeService.getEmployees().catch(() => [] as Employee[]);
      setEmployees(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const businesses = Array.from(new Set(employees.map(e => e.businessName).filter((b): b is string => !!b)));

  const filtered = employees.filter(e => {
    if (activeBusiness && e.businessName !== activeBusiness) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || (e.username?.toLowerCase().includes(q) ?? false);
  });

  return (
    <AdminTabLayout>
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
          <Header t={t} title="Team" />
        </View>

        <View style={[styles.filterArea, { backgroundColor: t.bg }]}>
          <Input t={t} placeholder="Cerca per nome o ruolo" value={search} onChangeText={setSearch} leadingIcon="search" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip t={t} label="Tutti" active={activeBusiness === null} onPress={() => setActiveBusiness(null)} />
            {businesses.map((b, i) => (
              <Chip key={i} t={t} label={b} active={activeBusiness === b} onPress={() => setActiveBusiness(b)} />
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
        >
          {loading ? (
            <Text style={[styles.empty, { color: t.textSecondary }]}>Caricamento…</Text>
          ) : filtered.length === 0 ? (
            <Text style={[styles.empty, { color: t.textSecondary }]}>Nessun dipendente trovato</Text>
          ) : (
            filtered.map(emp => (
              <Card
                key={emp.id}
                t={t}
                padding={14}
                onPress={() => router.push(`/(admin)/team/${emp.id}` as any)}
                style={{ opacity: emp.isActive ? 1 : 0.55 }}
              >
                <View style={styles.empRow}>
                  <Avatar t={t} initials={initials(emp.name)} size={44} />
                  <View style={styles.flex1}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.name, { color: t.text }]}>{emp.name}</Text>
                      <SmallPill bg={t.surfaceLow} color={t.textSecondary}>
                        {CONTRACT_LABELS[emp.contractType] ?? emp.contractType}
                      </SmallPill>
                    </View>
                    <Text style={[styles.meta, { color: t.textSecondary }]} numberOfLines={1}>
                      {emp.username ? `@${emp.username}` : emp.email ?? '—'}
                      {emp.businessName ? ` · ${emp.businessName}` : ''}
                    </Text>
                  </View>
                  <StatusBadge t={t} kind={emp.isActive ? 'active' : 'inactive'} dot />
                  <Icon name="chev-r" size={18} color={t.textSecondary} strokeWidth={2} />
                </View>
              </Card>
            ))
          )}

          <TouchableOpacity
            style={[styles.addCard, { borderColor: t.border }]}
            onPress={() => router.push('/(admin)/team/new' as any)}
          >
            <Icon name="plus" size={16} color={t.primary} strokeWidth={2.4} />
            <Text style={[styles.addTxt, { color: t.primary }]}>Aggiungi dipendente</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AdminTabLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filterArea: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  chips: { gap: 8, paddingBottom: 4 },
  list: { padding: 16, gap: 10, paddingBottom: 8 },
  empRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex1: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14.5 },
  meta: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 2 },
  empty: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, textAlign: 'center', padding: 24 },
  addCard: {
    borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 16,
    padding: 16, marginTop: 4,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  addTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
});
