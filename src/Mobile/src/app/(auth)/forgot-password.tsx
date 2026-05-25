import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Icon, PrimaryBtn, Input, DragHandle } from '@/components/ui';
import { Hero } from '@/components/ui/Hero';
import { AuthService } from '@/services/auth.service';
import { textOnPrimary } from '@/constants/tokens';

export default function ForgotPasswordScreen() {
  const { t } = useTheme();
  const fg = textOnPrimary(t);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim() || loading) return;
    setError('');
    setLoading(true);
    try {
      await AuthService.forgotPassword(email.trim());
      setSent(true);
    } catch {
      setError('Impossibile inviare la email. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Hero t={t} height={210}>
        <View style={styles.heroContent}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <Icon name="key" size={30} color={fg} strokeWidth={2} />
          </View>
          <Text style={[styles.heroTitle, { color: fg }]}>Recupera password</Text>
        </View>
      </Hero>

      <View style={[styles.card, { backgroundColor: t.surface }]}>
        <DragHandle t={t} />

        {!sent ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={[styles.title, { color: t.text }]}>Reimposta password</Text>
            <Text style={[styles.sub, { color: t.textSecondary }]}>
              Inserisci la tua email. Ti invieremo un link sicuro per impostarne una nuova.
            </Text>

            <Input
              t={t}
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leadingIcon="mail"
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: t.errorBg }]}>
                <Text style={[styles.errorText, { color: t.errorText }]}>{error}</Text>
              </View>
            ) : null}

            <PrimaryBtn t={t} onPress={handleSend} disabled={!email.trim() || loading} style={{ marginTop: 6 }}>
              {loading ? 'Invio in corso…' : 'Invia link di reset'}
            </PrimaryBtn>

            <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
              <Text style={[styles.backText, { color: t.primary }]}>‹ Torna al login</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.successContent}>
            <View style={[styles.checkCircle, { backgroundColor: t.successBg }]}>
              <Icon name="check" size={36} color={t.successText} strokeWidth={2.5} />
            </View>
            <Text style={[styles.successTitle, { color: t.text }]}>Email inviata!</Text>
            <Text style={[styles.successBody, { color: t.textSecondary }]}>
              Controlla la tua casella{' '}
              <Text style={{ color: t.text, fontFamily: 'PlusJakartaSans-SemiBold' }}>{email}</Text>
              {' '}e clicca il link per impostare una nuova password.
            </Text>

            <PrimaryBtn t={t} onPress={() => router.replace({ pathname: '/(auth)/login', params: { role: 'admin' } })}
              style={{ marginTop: 4 }}>
              Torna al login
            </PrimaryBtn>

            <TouchableOpacity onPress={handleSend} style={{ marginTop: 8 }}>
              <Text style={[styles.resendText, { color: t.textSecondary }]}>
                Non hai ricevuto l'email?{' '}
                <Text style={{ color: t.primary, fontFamily: 'PlusJakartaSans-SemiBold' }}>Reinvia</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContent: { alignItems: 'center', gap: 14 },
  iconBox: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, letterSpacing: -0.2 },
  card: { flex: 1, borderRadius: 28, marginTop: -16 },
  content: { padding: 24, gap: 22 },
  title: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, letterSpacing: -0.3, marginBottom: -8 },
  sub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, lineHeight: 20, marginBottom: -6 },
  errorBox: { borderRadius: 10, padding: 12 },
  errorText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13 },
  backLink: { alignItems: 'center', paddingTop: 4 },
  backText: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 13 },
  successContent: {
    padding: 24, alignItems: 'center', gap: 16,
  },
  checkCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, letterSpacing: -0.4 },
  successBody: {
    fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, lineHeight: 22,
    textAlign: 'center', paddingHorizontal: 12,
  },
  resendText: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13 },
});
