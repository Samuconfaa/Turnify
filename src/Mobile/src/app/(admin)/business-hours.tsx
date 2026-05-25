import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Card, Header, Icon, PrimaryBtn, Toggle } from '@/components/ui';
import { BusinessService } from '@/services/business.service';
import { apiError } from '@/services/api';

const DAY_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DAY_ACCENTS = [null, null, null, null, null, '#B45309', null] as const;

interface DayHours {
  label: string;
  open: boolean;
  from: string;
  to: string;
  accent?: string | null;
}

const DEFAULT_HOURS: DayHours[] = DAY_NAMES.map((label, i) => ({
  label, open: i < 6, from: i === 5 ? '08:00' : '07:00', to: i === 5 ? '24:00' : '23:00', accent: DAY_ACCENTS[i],
}));

export default function BusinessHoursScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS.map(d => ({ ...d })));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    BusinessService.getOpeningHours(Number(id))
      .then(apiHours => {
        if (apiHours.length === 0) { setLoading(false); return; }
        const mapped = DEFAULT_HOURS.map((d, i) => {
          const h = apiHours.find(a => a.dayOfWeek === i + 1);
          if (!h) return { ...d };
          return { ...d, open: !h.isClosed, from: h.openTime.slice(0, 5), to: h.closeTime.slice(0, 5) };
        });
        setHours(mapped);
      })
      .catch(() => {}) // keep defaults on error
      .finally(() => setLoading(false));
  }, [id]);

  const toggle = (i: number, open: boolean) => {
    setHours(prev => prev.map((d, idx) => idx === i ? { ...d, open } : d));
  };

  const setFrom = (i: number, from: string) => {
    setHours(prev => prev.map((d, idx) => idx === i ? { ...d, from } : d));
  };

  const setTo = (i: number, to: string) => {
    setHours(prev => prev.map((d, idx) => idx === i ? { ...d, to } : d));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload = hours.map((d, i) => ({
        dayOfWeek: i + 1,
        openTime: d.open ? d.from : '00:00',
        closeTime: d.open ? d.to : '00:00',
        isClosed: !d.open,
      }));
      await BusinessService.saveOpeningHours(Number(id), payload);
      router.back();
    } catch (e) {
      Alert.alert('Errore', apiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Orari di apertura"
          leading={
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="chev-l" size={20} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
          }
        />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={t.primary} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Card t={t} padding={0}>
            {hours.map((d, i) => (
              <View
                key={i}
                style={[styles.dayRow, i < 6 && { borderBottomWidth: 1, borderBottomColor: t.borderSoft }]}
              >
                <View style={styles.dayLabelWrap}>
                  <Text style={[styles.dayLabel, { color: d.accent ?? t.text }]}>{d.label}</Text>
                  {!d.open && <Text style={[styles.closedTxt, { color: t.textSecondary }]}>Chiuso</Text>}
                </View>
                {d.open ? (
                  <View style={styles.timesRow}>
                    <TouchableOpacity style={[styles.timeInput, { borderColor: t.border }]}>
                      <Text style={[styles.timeLabel, { color: t.textSecondary }]}>DAL</Text>
                      <Text style={[styles.timeValue, { color: t.text }]}>{d.from}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.timeInput, { borderColor: t.border }]}>
                      <Text style={[styles.timeLabel, { color: t.textSecondary }]}>AL</Text>
                      <Text style={[styles.timeValue, { color: t.text }]}>{d.to}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.flex1} />
                )}
                <Toggle t={t} value={d.open} onValueChange={v => toggle(i, v)} />
              </View>
            ))}
          </Card>
          <PrimaryBtn t={t} onPress={handleSave} disabled={saving}>
            {saving ? 'Salvataggio…' : 'Salva orari'}
          </PrimaryBtn>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 18, gap: 16, paddingBottom: 32 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  dayLabelWrap: { width: 90 },
  dayLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  closedTxt: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, marginTop: 2 },
  timesRow: { flex: 1, flexDirection: 'row', gap: 8 },
  timeInput: {
    flex: 1, height: 36, borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  timeLabel: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 10, letterSpacing: 0.4 },
  timeValue: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  flex1: { flex: 1 },
});
