import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Logo, Card, Icon } from '@/components/ui';

export default function RoleSelectionScreen() {
  const { t } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Logo */}
      <View style={styles.logoWrap}>
        <Logo size={42} color={t.primary} textColor={t.text} />
      </View>

      {/* Heading */}
      <View style={styles.heading}>
        <Text style={[styles.title, { color: t.text }]}>Bentornato</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Scegli come vuoi accedere a Turnify.
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.cards}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/login', params: { role: 'admin' } })} activeOpacity={0.85}>
          <View style={[styles.roleCard, { backgroundColor: t.surface, borderColor: t.primary, borderWidth: 2 }]}>
            <View style={[styles.iconBox, { backgroundColor: t.primaryLight }]}>
              <Icon name="briefcase" size={22} color={t.primary} />
            </View>
            <View style={styles.roleText}>
              <Text style={[styles.roleTitle, { color: t.text }]}>Admin / Manager</Text>
              <Text style={[styles.roleSub, { color: t.textSecondary }]}>Gestisci team e turni</Text>
            </View>
            <Icon name="chev-r" size={20} color={t.primary} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/login', params: { role: 'employee' } })} activeOpacity={0.85}>
          <View style={[styles.roleCard, { backgroundColor: t.surface, borderColor: t.border, borderWidth: 1 }]}>
            <View style={[styles.iconBox, { backgroundColor: t.surfaceLow }]}>
              <Icon name="user" size={22} color={t.text} />
            </View>
            <View style={styles.roleText}>
              <Text style={[styles.roleTitle, { color: t.text }]}>Dipendente</Text>
              <Text style={[styles.roleSub, { color: t.textSecondary }]}>Visualizza turni e timbra</Text>
            </View>
            <Icon name="chev-r" size={20} color={t.textSecondary} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: t.border }]} />
          <Text style={[styles.orText, { color: t.textSecondary }]}>oppure</Text>
          <View style={[styles.line, { backgroundColor: t.border }]} />
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerLink}>
          <Text style={[styles.registerText, { color: t.text }]}>
            Nuovo qui?{' '}
            <Text style={{ color: t.primary, fontFamily: 'PlusJakartaSans-SemiBold' }}>
              Registra la tua azienda
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity><Text style={[styles.footerLink, { color: t.textSecondary }]}>Termini di servizio</Text></TouchableOpacity>
        <Text style={{ color: t.border, opacity: 0.5 }}> · </Text>
        <TouchableOpacity><Text style={[styles.footerLink, { color: t.textSecondary }]}>Privacy</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  logoWrap: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 24 },
  heading: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16, alignItems: 'center' },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  cards: { flex: 1, paddingHorizontal: 20, gap: 12 },
  roleCard: {
    borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  roleText: { flex: 1 },
  roleTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15 },
  roleSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginTop: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  line: { flex: 1, height: 1 },
  orText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
  registerLink: { alignItems: 'center' },
  registerText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14 },
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 20, paddingTop: 8,
  },
  footerLink: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
});
