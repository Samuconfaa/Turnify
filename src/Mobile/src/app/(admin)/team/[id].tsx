import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, Card, Header, Icon, Input, PrimaryBtn, DangerBtn, SectionLabel } from '@/components/ui';
import { EmployeeService } from '@/services/employee.service';
import { apiError } from '@/services/api';
import { textOnPrimary } from '@/constants/tokens';
import type { Employee, VacationBalance } from '@/types/employee.types';

const CONTRACT_OPTIONS = ['FullTime', 'PartTime', 'Freelance', 'Internship'];
const CONTRACT_LABELS: Record<string, string> = {
  FullTime: 'Full-time', PartTime: 'Part-time', Freelance: 'Freelance', Internship: 'Stage',
};

function initials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

export default function EmployeeDetail() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const textOnPri = textOnPrimary(t);

  const [emp, setEmp] = useState<Employee | null>(null);
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [contractType, setContractType] = useState('FullTime');
  const [weeklyHours, setWeeklyHours] = useState('40');
  const [password, setPassword] = useState('');
  const [vacDays, setVacDays] = useState(26);

  useEffect(() => {
    if (isNew) return;
    const numId = Number(id);
    Promise.all([
      EmployeeService.getEmployee(numId),
      EmployeeService.getVacationBalance(numId).catch(() => null),
    ]).then(([e, b]) => {
      setEmp(e);
      if (b) { setBalance(b); setVacDays(b.totalDays); }
      const parts = e.name.split(' ');
      setFirstName(parts[0] ?? '');
      setLastName(parts.slice(1).join(' '));
      setUsername(e.username ?? '');
      setEmail(e.email ?? '');
      setPhone(e.phone ?? '');
      setContractType(e.contractType);
    }).catch(err => {
      Alert.alert('Errore', apiError(err));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      Alert.alert('Errore', 'Nome, cognome e username sono obbligatori.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        if (!password) { Alert.alert('Errore', 'La password è obbligatoria.'); setSaving(false); return; }
        await EmployeeService.createEmployee({ firstName, lastName, username, email: email || undefined, phone: phone || undefined, role: role || undefined, contractType, weeklyHours: Number(weeklyHours), password });
      } else {
        await EmployeeService.updateEmployee(Number(id), { firstName, lastName, username, email: email || undefined, phone: phone || undefined, role: role || undefined, contractType, weeklyHours: Number(weeklyHours) });
        if (balance && vacDays !== balance.totalDays) {
          await EmployeeService.updateVacationBalance(Number(id), vacDays);
        }
      }
      router.back();
    } catch (e) {
      Alert.alert('Errore', apiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = () => {
    Alert.alert('Disattiva dipendente', 'Il dipendente non potrà più accedere all\'app. Continuare?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Disattiva', style: 'destructive', onPress: async () => {
        try {
          await EmployeeService.deactivateEmployee(Number(id));
          router.back();
        } catch (e) { Alert.alert('Errore', apiError(e)); }
      }},
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title={isNew ? 'Nuovo dipendente' : (emp?.name ?? '…')}
          leading={
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="chev-l" size={20} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
          }
          trailing={!isNew ? (
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.surfaceLow }]}>
              <Icon name="more" size={18} color={t.text} />
            </TouchableOpacity>
          ) : undefined}
        />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={t.primary} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <SectionLabel t={t}>Dati personali</SectionLabel>
          <View style={styles.row2}>
            <View style={styles.flex1}>
              <Input t={t} label="Nome" value={firstName} onChangeText={setFirstName} />
            </View>
            <View style={styles.flex1}>
              <Input t={t} label="Cognome" value={lastName} onChangeText={setLastName} />
            </View>
          </View>
          <Input t={t} label="Username" value={username} onChangeText={setUsername}
            leadingIcon="user" helper="Identificatore univoco per il login" autoCapitalize="none" />

          <SectionLabel t={t} style={styles.sectionGap}>Contatti</SectionLabel>
          <Input t={t} label="Email (opzionale)" value={email} onChangeText={setEmail}
            leadingIcon="mail" keyboardType="email-address" autoCapitalize="none" />
          <Input t={t} label="Telefono (opzionale)" value={phone} onChangeText={setPhone}
            leadingIcon="phone" keyboardType="phone-pad" />

          <SectionLabel t={t} style={styles.sectionGap}>Lavoro</SectionLabel>
          <Input t={t} label="Ruolo in azienda" value={role} onChangeText={setRole} leadingIcon="briefcase" />
          <View style={styles.row2}>
            <View style={{ flex: 1.4 }}>
              <Input t={t} label="Tipo contratto" value={CONTRACT_LABELS[contractType] ?? contractType}
                onChangeText={() => {}} trailingIcon="chev-d" />
            </View>
            <View style={styles.flex1}>
              <Input t={t} label="Ore / sett." value={weeklyHours} onChangeText={setWeeklyHours}
                leadingIcon="clock" keyboardType="numeric" />
            </View>
          </View>

          {!isNew && (
            <>
              <SectionLabel t={t} style={styles.sectionGap}>Saldo ferie</SectionLabel>
              <Card t={t} padding={16}>
                <View style={styles.balanceRow}>
                  <View style={[styles.palmBox, { backgroundColor: t.primaryLight }]}>
                    <Icon name="palm" size={18} color={t.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={[styles.balanceSub, { color: t.textSecondary }]}>Giorni assegnati</Text>
                    <View style={styles.balanceNums}>
                      <Text style={[styles.balanceVal, { color: t.text }]}>{vacDays}</Text>
                      <Text style={[styles.balanceMeta, { color: t.textSecondary }]}>
                        · {balance?.usedDays ?? 0} usati · {vacDays - (balance?.usedDays ?? 0)} rimanenti
                      </Text>
                    </View>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity style={[styles.stepBtn, { backgroundColor: t.surfaceLow }]}
                      onPress={() => setVacDays(d => Math.max(0, d - 1))}>
                      <Icon name="minus" size={14} color={t.text} strokeWidth={2.2} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.stepBtn, { backgroundColor: t.primary }]}
                      onPress={() => setVacDays(d => d + 1)}>
                      <Icon name="plus" size={14} color={textOnPri} strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </>
          )}

          {isNew && (
            <>
              <SectionLabel t={t} style={styles.sectionGap}>Sicurezza</SectionLabel>
              <Input t={t} label="Password temporanea" value={password} onChangeText={setPassword}
                secure leadingIcon="lock" helper="Sarà richiesta al primo accesso" />
            </>
          )}

          <View style={[styles.footer, { marginTop: 20 }]}>
            {!isNew && (
              <DangerBtn t={t} onPress={handleDeactivate} full={false} style={{ flex: 1 }}>
                Disattiva
              </DangerBtn>
            )}
            <PrimaryBtn t={t} onPress={handleSave} disabled={saving} style={{ flex: isNew ? 1 : 2 }}>
              {saving ? 'Salvataggio…' : 'Salva'}
            </PrimaryBtn>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 18, gap: 12, paddingBottom: 32 },
  row2: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  sectionGap: { marginTop: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  palmBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  balanceSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
  balanceNums: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  balanceVal: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, letterSpacing: -0.4 },
  balanceMeta: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
  stepper: { flexDirection: 'row', gap: 6 },
  stepBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', gap: 10 },
});
