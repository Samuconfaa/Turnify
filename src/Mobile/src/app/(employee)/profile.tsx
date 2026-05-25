import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { EmployeeTabLayout } from '@/components/EmployeeTabLayout';
import { Avatar, DangerBtn, Icon, SectionLabel, SettingsRow, Toggle } from '@/components/ui';
import { textOnPrimary } from '@/constants/tokens';

function initials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

export default function EmployeeProfileScreen() {
  const { t, dark } = useTheme();
  const { user, clearAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const textOnPri = textOnPrimary(t);
  const purpleBg = '#EEE5F7';
  const purpleColor = '#6D28D9';

  const handleLogout = () => {
    Alert.alert('Esci', 'Vuoi davvero uscire dall\'account?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: async () => { await clearAuth(); router.replace('/(auth)/role-selection' as any); } },
    ]);
  };

  return (
    <EmployeeTabLayout>
      <ScrollView style={[styles.root, { backgroundColor: t.bg }]} showsVerticalScrollIndicator={false}>
        {/* Gradient hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 20, backgroundColor: t.primary }]}>
          <View style={styles.heroTop}>
            <Text style={[styles.heroRole, { color: textOnPri }]}>PROFILO</Text>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <Icon name="pencil" size={16} color={textOnPri} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroInfo}>
            <View>
              <Avatar t={t} initials={initials(user?.name ?? '?')} size={88} bg="rgba(255,255,255,0.95)" color={t.primary} />
              <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: t.surface, borderColor: t.primary }]}>
                <Icon name="camera" size={14} color={t.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.heroName, { color: textOnPri }]}>{user?.name ?? '—'}</Text>
              <Text style={[styles.heroEmail, { color: textOnPri }]}>{user?.email ?? '—'}</Text>
              <View style={[styles.rolePill, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                <Icon name="briefcase" size={12} color={textOnPri} strokeWidth={2.2} />
                <Text style={[styles.rolePillTxt, { color: textOnPri }]}>Dipendente</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings card */}
        <View style={[styles.settingsCard, { backgroundColor: t.surface }]}>
          <SectionLabel t={t} style={{ marginTop: 8, marginBottom: 0 }}>Lavoro</SectionLabel>
          <View>
            <SettingsRow t={t} icon="swap" iconBg={purpleBg} iconColor={purpleColor} title="Scambi turno"
              onPress={() => Alert.alert('Info', 'Disponibile nella prossima versione.')} />
            <SettingsRow t={t} icon="check" iconBg={t.primaryLight} iconColor={t.primary} title="Disponibilità"
              onPress={() => router.push('/(employee)/availability' as any)} />
            <SettingsRow t={t} icon="doc" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Storico presenze" last
              onPress={() => router.push('/(employee)/attendance' as any)} />
          </View>

          <SectionLabel t={t} style={{ marginTop: 14, marginBottom: 0 }}>Account</SectionLabel>
          <View>
            <SettingsRow t={t} icon="camera" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Cambia foto profilo"
              onPress={() => Alert.alert('Info', 'Disponibile nella prossima versione.')} />
            <SettingsRow t={t} icon="lock" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Cambia password"
              onPress={() => Alert.alert('Info', 'Disponibile nella prossima versione.')} />
            <SettingsRow
              t={t} icon="moon" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Tema scuro"
              trailing={<Toggle t={t} value={dark} onValueChange={() => Alert.alert('Info', 'Cambia tema nelle impostazioni del dispositivo.')} />}
            />
            <SettingsRow t={t} icon="shield" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="I tuoi dati (GDPR)" last
              onPress={() => Alert.alert('Info', 'Disponibile nella prossima versione.')} />
          </View>

          <View style={styles.logoutWrap}>
            <DangerBtn t={t} onPress={handleLogout}>
              <Icon name="logout" size={18} color={t.danger} strokeWidth={2} /> Esci dall'account
            </DangerBtn>
          </View>
          <Text style={[styles.version, { color: t.textSecondary }]}>Turnify v1.0.0</Text>
        </View>
      </ScrollView>
    </EmployeeTabLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { padding: 20, paddingBottom: 70 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  heroRole: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, letterSpacing: 0.8, opacity: 0.85, textTransform: 'uppercase' },
  editBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1, minWidth: 0 },
  heroName: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, letterSpacing: -0.3 },
  heroEmail: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, opacity: 0.88, marginTop: 2 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, alignSelf: 'flex-start' },
  rolePillTxt: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 11, letterSpacing: 0.3 },
  settingsCard: { flex: 1, borderRadius: 24, marginTop: -28, padding: 14, paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  logoutWrap: { marginTop: 20 },
  version: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, textAlign: 'center', marginTop: 14, opacity: 0.7 },
});
