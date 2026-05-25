import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Card, Header, Icon, PrimaryBtn, SectionLabel, Toggle } from '@/components/ui';
import { EmployeeService } from '@/services/employee.service';
import { apiError } from '@/services/api';

const DAY_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DAY_ACCENTS = [null, null, null, null, null, '#B45309', 'danger'] as const;

export default function AvailabilityScreen() {
  const { t } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const empId = user?.employeeId;

  const [available, setAvailable] = useState<boolean[]>([true, true, true, false, true, true, false]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!empId) { setLoading(false); return; }
    EmployeeService.getEmployee(empId)
      .then(emp => {
        if (emp.availableDays && emp.availableDays.length > 0) {
          setAvailable(Array.from({ length: 7 }, (_, i) => emp.availableDays!.includes(i)));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [empId]);

  const handleSave = async () => {
    if (!empId) return;
    setSaving(true);
    try {
      const days = available.map((v, i) => v ? i : -1).filter(i => i >= 0);
      await EmployeeService.updateEmployee(empId, { availableDays: days } as any);
      router.back();
    } catch (e) { Alert.alert('Errore', apiError(e)); }
    finally { setSaving(false); }
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Disponibilità"
          leading={
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="chev-l" size={20} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
          }
        />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator color={t.primary} /></View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoBanner, { backgroundColor: t.primaryLight }]}>
            <View style={[styles.infoIconWrap, { backgroundColor: t.primary }]}>
              <Icon name="sparkle" size={18} color="#fff" strokeWidth={2} />
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.infoTitle, { color: t.successText }]}>Indica i giorni in cui sei disponibile</Text>
              <Text style={[styles.infoSub, { color: t.successText }]}>
                Il manager userà queste preferenze per pianificare i tuoi turni settimanali.
              </Text>
            </View>
          </View>

          <Card t={t} padding={0}>
            {DAY_NAMES.map((label, i) => {
              const accent = DAY_ACCENTS[i] === 'danger' ? t.danger : (DAY_ACCENTS[i] ?? t.text);
              return (
                <View
                  key={i}
                  style={[styles.dayRow, i < 6 && { borderBottomWidth: 1, borderBottomColor: t.borderSoft }]}
                >
                  <Text style={[styles.dayLabel, { color: accent }]}>{label}</Text>
                  <Text style={[styles.availLabel, { color: available[i] ? t.primary : t.textSecondary }]}>
                    {available[i] ? 'Sì' : 'No'}
                  </Text>
                  <Toggle t={t} value={available[i]} onValueChange={v => setAvailable(prev => prev.map((x, idx) => idx === i ? v : x))} />
                </View>
              );
            })}
          </Card>

          <SectionLabel t={t} style={{ marginTop: 4 }}>Note per il manager</SectionLabel>
          <TextInput
            style={[styles.noteInput, { borderColor: t.border, color: t.text, backgroundColor: t.surface }]}
            multiline
            numberOfLines={3}
            placeholder="Preferisco turni del mattino. Posso fare straordinari il venerdì."
            placeholderTextColor={t.textSecondary}
            value={note}
            onChangeText={setNote}
          />

          <PrimaryBtn t={t} onPress={handleSave} disabled={saving}>
            {saving ? 'Salvataggio…' : 'Salva disponibilità'}
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
  infoBanner: { borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1 },
  infoTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13.5 },
  infoSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12.5, marginTop: 4, lineHeight: 18, opacity: 0.88 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16 },
  dayLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, flex: 1 },
  availLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12 },
  noteInput: {
    borderWidth: 1, borderRadius: 12, padding: 14,
    minHeight: 70, fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, lineHeight: 20,
    textAlignVertical: 'top',
  },
});
