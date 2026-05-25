import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Icon, PrimaryBtn, OutlineBtn, Input, DragHandle } from '@/components/ui';
import { Hero } from '@/components/ui/Hero';
import { AuthService, parseJwtUser } from '@/services/auth.service';
import { textOnPrimary } from '@/constants/tokens';

export default function LoginScreen() {
  const { t, dark } = useTheme();
  const { setAuth } = useAuth();
  const { role } = useLocalSearchParams<{ role: 'admin' | 'employee' }>();
  const isEmployee = role === 'employee';

  const [email, setEmail] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fg = textOnPrimary(t);

  const canLogin = isEmployee
    ? companySlug.trim().length > 0 && username.trim().length > 0 && password.length > 0
    : email.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!canLogin || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = isEmployee
        ? await AuthService.loginEmployee({ companySlug: companySlug.trim(), username: username.trim(), password })
        : await AuthService.loginAdmin({ email: email.trim(), password });

      const parsed = parseJwtUser(res.accessToken ?? (res as any).token);
      if (!parsed) throw new Error('Token non valido');

      await setAuth(res.accessToken ?? (res as any).token, res.refreshToken, {
        id: res.userId ?? parsed.id,
        name: res.name ?? parsed.name,
        email: res.email ?? parsed.email,
        username: res.username ?? null,
        role: res.role ?? parsed.role,
        companyId: res.companyId ?? parsed.companyId,
        employeeId: res.employeeId ?? parsed.employeeId,
      });

      router.replace('/');
    } catch (e: any) {
      const msg = e?.response?.status === 429
        ? 'Troppi tentativi. Riprova tra qualche minuto.'
        : e?.response?.status === 401 || e?.response?.status === 400
        ? isEmployee
          ? 'Credenziali non valide. Verifica azienda, nome utente e password.'
          : 'Credenziali non valide. Verifica email e password.'
        : 'Errore di connessione al server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        {/* Hero */}
        <Hero t={t} height={210}>
          <View style={styles.heroContent}>
            <View style={[styles.iconBox, { borderColor: 'rgba(255,255,255,0.30)' }]}>
              <Icon name="clock" size={32} color={fg} strokeWidth={2} />
            </View>
            <Text style={[styles.heroTitle, { color: fg }]}>Turnify</Text>
          </View>
        </Hero>

        {/* Card */}
        <ScrollView
          style={[styles.card, { backgroundColor: t.surface }]}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DragHandle t={t} />
          <Text style={[styles.cardTitle, { color: t.text }]}>
            {isEmployee ? 'Accedi come Dipendente' : 'Accedi come Admin'}
          </Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            {isEmployee ? 'Inserisci il codice della tua azienda' : 'Gestisci la tua azienda'}
          </Text>

          <View style={styles.form}>
            {isEmployee ? (
              <>
                <Input t={t} label="Codice azienda" value={companySlug} onChangeText={setCompanySlug}
                  autoCapitalize="none" autoCorrect={false} leadingIcon="building" />
                <Input t={t} label="Username" value={username} onChangeText={setUsername}
                  autoCapitalize="none" autoCorrect={false} leadingIcon="user" />
              </>
            ) : (
              <Input t={t} label="Email" value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} leadingIcon="mail" />
            )}

            <Input t={t} label="Password" value={password} onChangeText={setPassword}
              secure leadingIcon="lock" />

            {!isEmployee && (
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotRow}>
                <Text style={[styles.forgot, { color: t.primary }]}>Password dimenticata?</Text>
              </TouchableOpacity>
            )}

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: t.errorBg }]}>
                <Text style={[styles.errorText, { color: t.errorText }]}>{error}</Text>
              </View>
            ) : null}

            <PrimaryBtn t={t} onPress={handleLogin} disabled={!canLogin || loading}>
              {loading ? 'Accesso in corso…' : 'Accedi'}
            </PrimaryBtn>

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: t.border }]} />
              <Text style={[styles.orText, { color: t.textSecondary }]}>oppure</Text>
              <View style={[styles.line, { backgroundColor: t.border }]} />
            </View>

            <OutlineBtn t={t} onPress={() => router.push('/(auth)/register')}>Registrati</OutlineBtn>
          </View>

          <Text style={[styles.disclaimer, { color: t.textSecondary }]}>
            Continuando accetti i Termini e la Privacy.
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heroContent: { alignItems: 'center', gap: 14 },
  iconBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22, letterSpacing: -0.4,
  },
  card: {
    flex: 1, borderRadius: 28, marginTop: -16,
  },
  cardContent: { padding: 24, gap: 0, paddingBottom: 40 },
  cardTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, letterSpacing: -0.3, marginTop: 6, marginBottom: 4 },
  cardSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginBottom: 20 },
  form: { gap: 16 },
  forgotRow: { alignSelf: 'flex-end', marginTop: -4 },
  forgot: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 13 },
  errorBox: { borderRadius: 10, padding: 12 },
  errorText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, lineHeight: 18 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  line: { flex: 1, height: 1 },
  orText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
  disclaimer: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, textAlign: 'center', marginTop: 16 },
});
