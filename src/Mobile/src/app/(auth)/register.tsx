import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { PrimaryBtn, Input, SectionLabel, DragHandle } from '@/components/ui';
import { Hero } from '@/components/ui/Hero';
import { AuthService } from '@/services/auth.service';
import { textOnPrimary } from '@/constants/tokens';

export default function RegisterScreen() {
  const { t } = useTheme();

  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleCompanyName = (v: string) => {
    setCompanyName(v);
    if (!companySlug || companySlug === autoSlug(companyName)) {
      setCompanySlug(autoSlug(v));
    }
  };

  const handleRegister = async () => {
    if (loading) return;
    setError('');
    if (!companyName.trim() || !companySlug.trim() || !companyEmail.trim() || !adminEmail.trim() || !adminPassword) {
      setError('Compila tutti i campi obbligatori.');
      return;
    }
    if (adminPassword !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }
    setLoading(true);
    try {
      await AuthService.register({ companyName, companySlug, companyEmail, adminEmail, adminPassword });
      Alert.alert('Registrazione completata', 'Azienda creata. Ora puoi accedere.', [
        { text: 'OK', onPress: () => router.replace({ pathname: '/(auth)/login', params: { role: 'admin' } }) },
      ]);
    } catch (e: any) {
      const status = e?.response?.status;
      setError(
        status === 409
          ? 'Esiste già un\'azienda con lo stesso slug o email admin già in uso.'
          : status === 400
          ? (e?.response?.data?.message ?? 'Dati non validi.')
          : 'Impossibile contattare il server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        <Hero t={t} height={150} style={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <Text style={[styles.heroTitle, { color: textOnPrimary(t) }]}>Crea il tuo account</Text>
          <Text style={[styles.heroSub, { color: textOnPrimary(t) }]}>Registra la tua azienda in pochi secondi</Text>
        </Hero>

        <ScrollView
          style={[styles.card, { backgroundColor: t.surface }]}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DragHandle t={t} />

          <SectionLabel t={t} style={{ marginTop: 12 }}>Dati Azienda</SectionLabel>
          <View style={styles.section}>
            <Input t={t} label="Nome Azienda" value={companyName} onChangeText={handleCompanyName}
              leadingIcon="building" autoCorrect={false} />
            <Input t={t} label="Slug identificativo" value={companySlug}
              onChangeText={setCompanySlug}
              autoCapitalize="none" autoCorrect={false} leadingIcon="globe"
              helper={companySlug ? `turniup.it/${companySlug}` : undefined} />
            <Input t={t} label="Email aziendale" value={companyEmail} onChangeText={setCompanyEmail}
              keyboardType="email-address" autoCapitalize="none" leadingIcon="mail" />
          </View>

          <SectionLabel t={t} style={{ marginTop: 8 }}>Account Admin</SectionLabel>
          <View style={styles.section}>
            <Input t={t} label="Email Admin" value={adminEmail} onChangeText={setAdminEmail}
              keyboardType="email-address" autoCapitalize="none" leadingIcon="mail" />
            <Input t={t} label="Password" value={adminPassword} onChangeText={setAdminPassword}
              secure leadingIcon="lock" />
            <Input t={t} label="Conferma Password" value={confirmPassword} onChangeText={setConfirmPassword}
              secure leadingIcon="lock"
              error={confirmPassword && adminPassword !== confirmPassword ? 'Le password non coincidono' : undefined} />
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: t.errorBg }]}>
              <Text style={[styles.errorText, { color: t.errorText }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <PrimaryBtn t={t} onPress={handleRegister} disabled={loading}>
              {loading ? 'Registrazione…' : 'Registrati'}
            </PrimaryBtn>
            <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
              <Text style={[styles.backText, { color: t.textSecondary }]}>
                Hai già un account?{' '}
                <Text style={{ color: t.primary, fontFamily: 'PlusJakartaSans-SemiBold' }}>Accedi</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heroTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, letterSpacing: -0.4 },
  heroSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, marginTop: 6, opacity: 0.9 },
  card: { flex: 1, borderRadius: 28, marginTop: -16 },
  content: { padding: 24, gap: 14, paddingBottom: 48 },
  section: { gap: 14 },
  errorBox: { borderRadius: 10, padding: 12 },
  errorText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, lineHeight: 18 },
  actions: { gap: 12, marginTop: 8 },
  backLink: { alignItems: 'center' },
  backText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13 },
});
