import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Card, Header, Icon, SmallPill, StatusBadge } from '@/components/ui';
import { BusinessService } from '@/services/business.service';
import type { Business } from '@/types/employee.types';

const ACCENT_COLORS = ['#006948', '#0284C7', '#F59E0B', '#6D28D9', '#BA1A1A'];

function initials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

export default function BusinessesScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await BusinessService.getBusinesses().catch(() => []);
      setBusinesses(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Attività"
          subtitle="Le mie sedi"
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
        {loading ? (
          <Text style={[styles.empty, { color: t.textSecondary }]}>Caricamento…</Text>
        ) : businesses.length === 0 ? (
          <Text style={[styles.empty, { color: t.textSecondary }]}>Nessuna attività configurata</Text>
        ) : (
          businesses.map((b, i) => {
            const accent = ACCENT_COLORS[i % ACCENT_COLORS.length]!;
            return (
              <Card key={b.id} t={t} padding={0} accent={accent}>
                <View style={styles.cardInner}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.bizName, { color: t.text }]}>{b.name}</Text>
                    <StatusBadge t={t} kind={b.isActive !== false ? 'active' : 'inactive'} dot
                      label={b.isActive !== false ? 'Attiva' : 'Inattiva'} />
                  </View>
                  {b.businessType && (
                    <Text style={[styles.type, { color: t.textSecondary }]}>{b.businessType}</Text>
                  )}
                  {b.address && (
                    <View style={styles.addrRow}>
                      <Icon name="pin" size={13} color={t.textSecondary} strokeWidth={1.8} />
                      <Text style={[styles.addr, { color: t.textSecondary }]}>{b.address}</Text>
                    </View>
                  )}
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: t.surfaceLow }]}
                      onPress={() => router.push(`/(admin)/businesses/${b.id}` as any)}
                    >
                      <Icon name="pencil" size={14} color={t.text} strokeWidth={2} />
                      <Text style={[styles.actionTxt, { color: t.text }]}>Modifica</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: t.primaryLight }]}
                      onPress={() => router.push({ pathname: '/(admin)/business-hours', params: { id: b.id } } as any)}
                    >
                      <Icon name="clock" size={14} color={t.primary} strokeWidth={2} />
                      <Text style={[styles.actionTxt, { color: t.primary }]}>Orari</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        <TouchableOpacity
          style={[styles.addCard, { borderColor: t.border }]}
          onPress={() => router.push('/(admin)/businesses/new' as any)}
        >
          <Icon name="plus" size={16} color={t.primary} strokeWidth={2.4} />
          <Text style={[styles.addTxt, { color: t.primary }]}>Aggiungi attività</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 10, paddingBottom: 32 },
  empty: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, textAlign: 'center', padding: 24 },
  cardInner: { padding: 14, paddingLeft: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  bizName: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15, flex: 1 },
  type: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginBottom: 2 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  addr: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12.5, flex: 1 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: { flex: 1, height: 36, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  addCard: {
    borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 16,
    padding: 16, marginTop: 4,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  addTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
});
