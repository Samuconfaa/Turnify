import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAvatar } from '@/context/AvatarContext';
import { AdminTabLayout } from '@/components/AdminTabLayout';
import { Avatar, DangerBtn, Icon, SectionLabel, SettingsRow, Toggle } from '@/components/ui';
import { textOnPrimary } from '@/constants/tokens';

function initials(name?: string): string {
  if (!name) return '?';
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

export default function AdminProfileScreen() {
  const { t, dark } = useTheme();
  const { user, clearAuth } = useAuth();
  const { avatarUri, pickAvatar } = useAvatar();
  const insets = useSafeAreaInsets();
  const textOnPri = textOnPrimary(t);

  const handleLogout = () => {
    Alert.alert('Esci', "Vuoi davvero uscire dall'account?", [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci', style: 'destructive', onPress: async () => {
          await clearAuth();
          router.replace('/(auth)/role-selection' as any);
        },
      },
    ]);
  };

  return (
    <AdminTabLayout>
      <ScrollView style={[styles.root, { backgroundColor: t.bg }]} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 20, backgroundColor: t.primary }]}>
          <View style={styles.heroTop}>
            <Text style={[styles.heroRole, { color: textOnPri }]}>PROFILO</Text>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <Icon name="pencil" size={16} color={textOnPri} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroInfo}>
            <View>
              <Avatar t={t} initials={initials(user?.name)} size={88} bg="rgba(255,255,255,0.95)" color={t.primary} uri={avatarUri} />
              <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: t.surface, borderColor: t.primary }]} onPress={pickAvatar}>
                <Icon name="camera" size={14} color={t.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.heroName, { color: textOnPri }]}>{user?.name ?? '—'}</Text>
              <Text style={[styles.heroEmail, { color: textOnPri }]}>{user?.email ?? '—'}</Text>
              <View style={[styles.rolePill, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                <Icon name="briefcase" size={12} color={textOnPri} strokeWidth={2.2} />
                <Text style={[styles.rolePillTxt, { color: textOnPri }]}>Admin</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings card */}
        <View style={[styles.settingsCard, { backgroundColor: t.surface }]}>
          <SectionLabel t={t} style={{ marginTop: 8, marginBottom: 0 }}>Gestione attività</SectionLabel>
          <View>
            <SettingsRow t={t} icon="users" iconBg={t.primaryLight} iconColor={t.primary} title="Team"
              onPress={() => router.push('/(admin)/team' as any)} />
            <SettingsRow t={t} icon="cal" iconBg={t.kpiBlueBg} iconColor={t.kpiBlue} title="Turni"
              onPress={() => router.push('/(admin)/shifts' as any)} />
            <SettingsRow t={t} icon="bar" iconBg='#EEE5F7' iconColor='#6D28D9' title="Report ore dipendenti"
              onPress={() => router.push('/(admin)/employee-reports' as any)} />
            <SettingsRow t={t} icon="download" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Scarica report CSV" last
              onPress={() => router.push('/(admin)/reports' as any)} />
          </View>

          <SectionLabel t={t} style={{ marginTop: 14, marginBottom: 0 }}>Account</SectionLabel>
          <View>
            <SettingsRow t={t} icon="lock" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Cambia password"
              onPress={() => router.push('/(admin)/change-password' as any)} />
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
          <Text style={[styles.version, { color: t.textSecondary }]}>TurniUp v1.0.0</Text>
        </View>
      </ScrollView>
    </AdminTabLayout>
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
