import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, FlatList,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { AdminTabLayout } from '@/components/AdminTabLayout';
import { Card, Icon, Input } from '@/components/ui';
import { ShiftService } from '@/services/shift.service';
import { EmployeeService } from '@/services/employee.service';
import { BusinessService } from '@/services/business.service';
import { apiError } from '@/services/api';
import type { Employee } from '@/types/employee.types';
import type { Business } from '@/types/employee.types';

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function combineDateTime(date: Date, time: Date): string {
  const d = new Date(date);
  d.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return d.toISOString();
}

function fmtTime(d: Date): string {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function fmtDate(d: Date): string {
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

type PickerMode = 'date' | 'startTime' | 'endTime' | null;

interface PickerModalProps {
  visible: boolean;
  mode: 'date' | 'time';
  value: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
  t: any;
}

function PickerModal({ visible, mode, value, onChange, onClose, t }: PickerModalProps) {
  const [local, setLocal] = useState(value);

  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display="default"
        onChange={(_: DateTimePickerEvent, d?: Date) => { if (d) onChange(d); onClose(); }}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={pmStyles.overlay}>
        <View style={[pmStyles.sheet, { backgroundColor: t.surface }]}>
          <View style={[pmStyles.bar, { backgroundColor: t.border }]} />
          <DateTimePicker
            value={local}
            mode={mode}
            display="spinner"
            locale="it-IT"
            onChange={(_: DateTimePickerEvent, d?: Date) => { if (d) setLocal(d); }}
            style={{ width: '100%' }}
          />
          <View style={pmStyles.row}>
            <TouchableOpacity style={[pmStyles.btn, { borderColor: t.border }]} onPress={onClose}>
              <Text style={[pmStyles.btnTxt, { color: t.textSecondary }]}>Annulla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[pmStyles.btn, { backgroundColor: t.primary }]} onPress={() => { onChange(local); onClose(); }}>
              <Text style={[pmStyles.btnTxt, { color: '#fff' }]}>Conferma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const pmStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  bar: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15 },
});

interface SelectModalProps<T> {
  visible: boolean;
  items: T[];
  onSelect: (item: T) => void;
  onClose: () => void;
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  sublabelExtractor?: (item: T) => string;
  title: string;
  t: any;
}

function SelectModal<T>({ visible, items, onSelect, onClose, keyExtractor, labelExtractor, sublabelExtractor, title, t }: SelectModalProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={smStyles.overlay}>
        <View style={[smStyles.sheet, { backgroundColor: t.surface }]}>
          <View style={[smStyles.bar, { backgroundColor: t.border }]} />
          <Text style={[smStyles.title, { color: t.text }]}>{title}</Text>
          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={() => <View style={[smStyles.sep, { backgroundColor: t.border }]} />}
            renderItem={({ item }) => (
              <TouchableOpacity style={smStyles.item} onPress={() => { onSelect(item); onClose(); }}>
                <Text style={[smStyles.label, { color: t.text }]}>{labelExtractor(item)}</Text>
                {sublabelExtractor && (
                  <Text style={[smStyles.sublabel, { color: t.textSecondary }]}>{sublabelExtractor(item)}</Text>
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={[smStyles.cancel, { borderColor: t.border }]} onPress={onClose}>
            <Text style={[smStyles.cancelTxt, { color: t.textSecondary }]}>Annulla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const smStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  bar: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, marginBottom: 12 },
  item: { paddingVertical: 14 },
  sep: { height: 1 },
  label: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  sublabel: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, marginTop: 2 },
  cancel: { marginTop: 16, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
});

export default function NewShiftScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(() => { const d = new Date(); d.setHours(9, 0, 0, 0); return d; });
  const [endTime, setEndTime] = useState(() => { const d = new Date(); d.setHours(17, 0, 0, 0); return d; });
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showBizModal, setShowBizModal] = useState(false);

  const load = useCallback(async () => {
    const [emps, bizs] = await Promise.all([
      EmployeeService.getEmployees().catch(() => [] as Employee[]),
      BusinessService.getBusinesses().catch(() => [] as Business[]),
    ]);
    setEmployees(emps);
    setBusinesses(bizs);
    if (bizs.length === 1) setSelectedBusiness(bizs[0]!);
  }, []);

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!selectedEmployee) { Alert.alert('Errore', 'Seleziona un dipendente.'); return; }
    if (!selectedBusiness) { Alert.alert('Errore', 'Seleziona un\'attività.'); return; }
    const start = combineDateTime(date, startTime);
    const end = combineDateTime(date, endTime);
    if (new Date(end) <= new Date(start)) { Alert.alert('Errore', 'L\'orario di fine deve essere successivo all\'inizio.'); return; }
    setSaving(true);
    try {
      await ShiftService.createShift({
        employeeId: selectedEmployee.id,
        businessId: selectedBusiness.id,
        startTime: start,
        endTime: end,
        note: note.trim() || undefined,
      });
      Alert.alert('Turno creato', `Turno assegnato a ${selectedEmployee.name}.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Errore', apiError(e));
    } finally {
      setSaving(false);
    }
  };

  const FieldRow = ({ label, value, onPress }: { label: string; value: string; onPress: () => void }) => (
    <TouchableOpacity style={[styles.fieldRow, { backgroundColor: t.surface, borderColor: t.border }]} onPress={onPress}>
      <Text style={[styles.fieldLabel, { color: t.textSecondary }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: value ? t.text : t.textSecondary }]}>
        {value || 'Seleziona…'}
      </Text>
      <Icon name="chev-r" size={16} color={t.textSecondary} strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <AdminTabLayout>
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.surface, borderColor: t.border, paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Icon name="arrow-l" size={20} color={t.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: t.text }]}>Nuovo turno</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card t={t} padding={16}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Chi</Text>
            <FieldRow
              label="Dipendente"
              value={selectedEmployee?.name ?? ''}
              onPress={() => setShowEmpModal(true)}
            />
            <FieldRow
              label="Attività"
              value={selectedBusiness?.name ?? ''}
              onPress={() => setShowBizModal(true)}
            />
          </Card>

          <Card t={t} padding={16}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Quando</Text>
            <FieldRow
              label="Data"
              value={fmtDate(date)}
              onPress={() => setPickerMode('date')}
            />
            <FieldRow
              label="Inizio"
              value={fmtTime(startTime)}
              onPress={() => setPickerMode('startTime')}
            />
            <FieldRow
              label="Fine"
              value={fmtTime(endTime)}
              onPress={() => setPickerMode('endTime')}
            />
          </Card>

          <Card t={t} padding={16}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Note</Text>
            <Input
              t={t}
              placeholder="Nota opzionale…"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </Card>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: saving ? t.primaryLight : t.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Icon name="check" size={18} color="#fff" strokeWidth={2.4} />
            <Text style={styles.saveTxt}>{saving ? 'Salvataggio…' : 'Crea turno'}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Pickers */}
        <PickerModal
          visible={pickerMode === 'date'}
          mode="date"
          value={date}
          onChange={setDate}
          onClose={() => setPickerMode(null)}
          t={t}
        />
        <PickerModal
          visible={pickerMode === 'startTime'}
          mode="time"
          value={startTime}
          onChange={setStartTime}
          onClose={() => setPickerMode(null)}
          t={t}
        />
        <PickerModal
          visible={pickerMode === 'endTime'}
          mode="time"
          value={endTime}
          onChange={setEndTime}
          onClose={() => setPickerMode(null)}
          t={t}
        />

        {/* Select modals */}
        <SelectModal
          visible={showEmpModal}
          items={employees}
          onSelect={setSelectedEmployee}
          onClose={() => setShowEmpModal(false)}
          keyExtractor={e => String(e.id)}
          labelExtractor={e => e.name}
          sublabelExtractor={e => e.username ? `@${e.username}` : (e.email ?? '')}
          title="Seleziona dipendente"
          t={t}
        />
        <SelectModal
          visible={showBizModal}
          items={businesses}
          onSelect={setSelectedBusiness}
          onClose={() => setShowBizModal(false)}
          keyExtractor={b => String(b.id)}
          labelExtractor={b => b.name}
          sublabelExtractor={b => b.businessType ?? ''}
          title="Seleziona attività"
          t={t}
        />
      </View>
    </AdminTabLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, letterSpacing: -0.3 },
  scroll: { padding: 16, gap: 14, paddingBottom: 32 },
  sectionTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13, letterSpacing: 0.2, marginBottom: 10, opacity: 0.7 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1,
    marginBottom: 8, gap: 10,
  },
  fieldLabel: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 13, width: 70 },
  fieldValue: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, flex: 1 },
  saveBtn: {
    height: 52, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  saveTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#fff' },
});
