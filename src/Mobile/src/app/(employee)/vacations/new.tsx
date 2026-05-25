import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { DragHandle, Icon, Input, PrimaryBtn, SectionLabel, SmallPill } from '@/components/ui';
import { VacationService } from '@/services/vacation.service';
import { apiError } from '@/services/api';
import { textOnPrimary } from '@/constants/tokens';
import type { VacationRequestType } from '@/types/vacation.types';

const TYPES: Array<{ type: VacationRequestType; label: string; icon: any }> = [
  { type: 'Holiday', label: 'Ferie', icon: 'palm' },
  { type: 'PaidLeave', label: 'Permesso', icon: 'clock' },
  { type: 'SickLeave', label: 'Malattia', icon: 'flag' },
];

function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (isNaN(a) || isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86400000) + 1;
}

function fmtInputDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${d.toLocaleString('it-IT', { month: 'short' })} ${d.getFullYear()}`;
}

export default function VacationNewScreen() {
  const { t } = useTheme();
  const textOnPri = textOnPrimary(t);

  const [selectedType, setSelectedType] = useState<VacationRequestType>('Holiday');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const days = daysBetween(fromDate, toDate);
  const canSubmit = fromDate.length >= 8 && toDate.length >= 8 && days > 0;

  const handleSubmit = async () => {
    if (!canSubmit) { Alert.alert('Attenzione', 'Compila le date correttamente.'); return; }
    setSaving(true);
    try {
      await VacationService.createVacation({ type: selectedType, startDate: fromDate, endDate: toDate, note: note || undefined });
      router.back();
    } catch (e) { Alert.alert('Errore', apiError(e)); }
    finally { setSaving(false); }
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} />
      <View style={[styles.sheet, { backgroundColor: t.surface }]}>
        <DragHandle t={t} />
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: t.text }]}>Nuova richiesta</Text>
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: t.surfaceLow }]} onPress={() => router.back()}>
            <Icon name="x" size={16} color={t.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.flex1} contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
          <SectionLabel t={t} style={{ marginBottom: 8 }}>Tipo di assenza</SectionLabel>
          <View style={styles.typeGrid}>
            {TYPES.map(({ type, label, icon }) => {
              const active = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeTile, {
                    backgroundColor: active ? t.primaryLight : t.surface,
                    borderColor: active ? t.primary : t.border,
                    borderWidth: active ? 2 : 1,
                  }]}
                  onPress={() => setSelectedType(type)}
                >
                  <Icon name={icon} size={20} color={active ? t.primary : t.textSecondary} strokeWidth={2} />
                  <Text style={[styles.typeTileLabel, { color: active ? t.primary : t.text }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SectionLabel t={t} style={{ marginTop: 16, marginBottom: 8 }}>Periodo</SectionLabel>
          <View style={styles.dateRow}>
            <View style={styles.flex1}>
              <Input t={t} label="Dal (YYYY-MM-DD)" value={fromDate} onChangeText={setFromDate} leadingIcon="cal" />
            </View>
            <View style={styles.flex1}>
              <Input t={t} label="Al (YYYY-MM-DD)" value={toDate} onChangeText={setToDate} leadingIcon="cal" />
            </View>
          </View>
          {days > 0 && (
            <View style={[styles.daysSummary, { backgroundColor: t.primaryLight }]}>
              <Icon name="check" size={18} color={t.primary} strokeWidth={2.4} />
              <Text style={[styles.daysSummaryTxt, { color: t.successText }]}>
                <Text style={{ fontWeight: '700' }}>{days} {days === 1 ? 'giorno' : 'giorni'}</Text> lavorativi selezionati
              </Text>
              <SmallPill bg={t.primary} color={textOnPri} style={{ height: 24 }}>
                {fmtInputDate(fromDate)} – {fmtInputDate(toDate)}
              </SmallPill>
            </View>
          )}

          <SectionLabel t={t} style={{ marginTop: 16, marginBottom: 8 }}>Nota (opzionale)</SectionLabel>
          <TextInput
            style={[styles.noteInput, { borderColor: t.border, color: t.text, backgroundColor: t.surface }]}
            multiline
            numberOfLines={4}
            placeholder="Es. Matrimonio, vacanza pianificata…"
            placeholderTextColor={t.textSecondary}
            value={note}
            onChangeText={setNote}
          />
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: t.borderSoft }]}>
          <PrimaryBtn t={t} onPress={handleSubmit} disabled={saving || !canSubmit}>
            {saving ? 'Invio…' : 'Invia richiesta'}
          </PrimaryBtn>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  backdrop: { flex: 1 },
  sheet: { borderRadius: 28, maxHeight: '88%', flexShrink: 1 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  sheetTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, letterSpacing: -0.3 },
  closeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1 },
  sheetBody: { paddingHorizontal: 20, paddingBottom: 20, gap: 0 },
  typeGrid: { flexDirection: 'row', gap: 8 },
  typeTile: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
  typeTileLabel: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12.5 },
  dateRow: { flexDirection: 'row', gap: 10 },
  daysSummary: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, marginTop: 10 },
  daysSummaryTxt: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, flex: 1 },
  noteInput: {
    borderWidth: 1, borderRadius: 12, padding: 14,
    minHeight: 80, fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, lineHeight: 20,
    textAlignVertical: 'top',
  },
  footer: { padding: 20, paddingTop: 12, borderTopWidth: 1 },
});
