import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, DragHandle, Icon, Input, SectionLabel, PrimaryBtn, DangerBtn } from '@/components/ui';
import { ShiftService } from '@/services/shift.service';
import { api, apiError } from '@/services/api';
import { textOnPrimary } from '@/constants/tokens';
import type { Shift } from '@/types/shift.types';

function isoToDateLabel(iso: string): string {
  const d = new Date(iso);
  const DAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
    'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function isoToTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function ShiftDetail() {
  const { t, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';

  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [note, setNote] = useState('');
  const [repeatWeeks, setRepeatWeeks] = useState(1);

  const textOnPri = textOnPrimary(t);

  useEffect(() => {
    if (isNew) return;
    ShiftService.getShift(Number(id))
      .then(s => {
        setShift(s);
        setDate(isoToDateLabel(s.startTime));
        setStartTime(isoToTime(s.startTime));
        setEndTime(isoToTime(s.endTime));
        setNote(s.note ?? '');
      })
      .catch(() => Alert.alert('Errore', 'Turno non trovato'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        // For new shifts, the full creation flow with employee picker is it-26
        Alert.alert('Presto disponibile', 'La creazione di turni sarà disponibile nella prossima versione.');
      } else {
        const startISO = new Date(shift!.startTime);
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        startISO.setHours(sh!, sm!, 0, 0);
        const endISO = new Date(shift!.startTime);
        endISO.setHours(eh!, em!, 0, 0);
        await ShiftService.updateShift(Number(id), {
          startTime: startISO.toISOString(),
          endTime: endISO.toISOString(),
          note: note || undefined,
        });
        router.back();
      }
    } catch (e) {
      Alert.alert('Errore', apiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Elimina turno', 'Questa azione non può essere annullata.', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina', style: 'destructive',
        onPress: async () => {
          try {
            await ShiftService.deleteShift(Number(id));
            router.back();
          } catch (e) {
            Alert.alert('Errore', apiError(e));
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} />
      <View style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: insets.bottom + 20 }]}>
        <DragHandle t={t} />

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: t.text }]}>
            {isNew ? 'Nuovo turno' : 'Modifica turno'}
          </Text>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: t.surfaceLow }]}
            onPress={() => router.back()}
          >
            <Icon name="x" size={16} color={t.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={t.primary} />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Recurring warning */}
            {!isNew && shift?.recurringGroupId && (
              <View style={[styles.recurringBanner, { backgroundColor: t.warningBg }]}>
                <Icon name="sparkle" size={14} color={t.warningText} strokeWidth={2.2} />
                <Text style={[styles.recurringTxt, { color: t.warningText }]}>
                  Turno ricorrente · modifica solo questo turno
                </Text>
              </View>
            )}

            {/* Employee */}
            <SectionLabel t={t} style={{ marginTop: 4, marginBottom: 8 }}>Dipendente</SectionLabel>
            <View style={[styles.empRow, { borderColor: t.border, backgroundColor: t.surface }]}>
              <Avatar t={t} initials={shift ? shift.employeeName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : '??'} size={36} />
              <View style={styles.flex1}>
                <Text style={[styles.empName, { color: t.text }]}>{shift?.employeeName ?? '— seleziona —'}</Text>
                <Text style={[styles.empSub, { color: t.textSecondary }]}>Dipendente</Text>
              </View>
              <Icon name="chev-d" size={18} color={t.textSecondary} strokeWidth={2} />
            </View>

            {/* Date & times */}
            <SectionLabel t={t} style={{ marginTop: 16, marginBottom: 8 }}>Orari</SectionLabel>
            <Input
              t={t}
              label="Data"
              value={date}
              onChangeText={setDate}
              leadingIcon="cal"
            />
            <View style={styles.timeRow}>
              <View style={styles.flex1}>
                <Input t={t} label="Ora inizio" value={startTime} onChangeText={setStartTime} leadingIcon="clock" keyboardType="numbers-and-punctuation" />
              </View>
              <View style={styles.flex1}>
                <Input t={t} label="Ora fine" value={endTime} onChangeText={setEndTime} leadingIcon="clock" keyboardType="numbers-and-punctuation" />
              </View>
            </View>
            <Input
              t={t}
              label="Etichetta / nota"
              value={note}
              onChangeText={setNote}
              placeholder="Es. Apertura, copertura pranzo…"
            />

            {/* Repeat (new only) */}
            {isNew && (
              <>
                <SectionLabel t={t} style={{ marginTop: 16, marginBottom: 8 }}>Ripeti</SectionLabel>
                <View style={[styles.repeatRow, { borderColor: t.border, backgroundColor: t.surface }]}>
                  <View style={styles.flex1}>
                    <Text style={[styles.repeatLabel, { color: t.text }]}>Ripeti per</Text>
                    <Text style={[styles.repeatSub, { color: t.textSecondary }]}>Stesso giorno della settimana</Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={[styles.stepBtn, { backgroundColor: t.surfaceLow }]}
                      onPress={() => setRepeatWeeks(w => Math.max(1, w - 1))}
                    >
                      <Icon name="minus" size={16} color={t.text} strokeWidth={2.2} />
                    </TouchableOpacity>
                    <Text style={[styles.stepCount, { color: t.text }]}>{repeatWeeks} sett.</Text>
                    <TouchableOpacity
                      style={[styles.stepBtn, { backgroundColor: t.primary }]}
                      onPress={() => setRepeatWeeks(w => Math.min(52, w + 1))}
                    >
                      <Icon name="plus" size={16} color={textOnPri} strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        )}

        {/* Footer */}
        <View style={[styles.footer, { borderColor: t.borderSoft }]}>
          {!isNew && (
            <DangerBtn t={t} onPress={handleDelete} full={false} style={{ flex: 1 }}>
              Elimina
            </DangerBtn>
          )}
          <PrimaryBtn t={t} onPress={handleSave} disabled={saving} style={{ flex: isNew ? 1 : 2 }}>
            {saving ? 'Salvataggio…' : 'Salva turno'}
          </PrimaryBtn>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '88%',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, letterSpacing: -0.3 },
  closeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  loadingWrap: { padding: 40, alignItems: 'center' },
  body: { paddingHorizontal: 20, paddingBottom: 8, gap: 12 },
  recurringBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10,
  },
  recurringTxt: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 12.5, flex: 1 },
  empRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderRadius: 12, padding: 12,
  },
  flex1: { flex: 1 },
  empName: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  empSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 2 },
  timeRow: { flexDirection: 'row', gap: 10 },
  repeatRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderRadius: 12, padding: 12,
  },
  repeatLabel: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 14 },
  repeatSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepCount: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, minWidth: 52, textAlign: 'center' },
  footer: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1,
  },
});
