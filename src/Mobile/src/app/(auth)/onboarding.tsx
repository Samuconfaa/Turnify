import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Logo, Card, Icon, Input, PrimaryBtn, OutlineBtn } from '@/components/ui';
import { api, apiError } from '@/services/api';
import { setStoredFlag } from '@/hooks/useStoredFlag';
import { textOnPrimary } from '@/constants/tokens';

const BUSINESS_TYPES = ['Ristorante', 'Bar', 'Pizzeria', 'Gelateria', 'Negozio', 'Palestra', 'Parrucchiere', 'Altro'];

function ProgressDots({ t, total, current }: { t: any; total: number; current: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[
          styles.dot,
          { width: i === current ? 24 : 8, backgroundColor: i <= current ? t.primary : t.border },
        ]} />
      ))}
    </View>
  );
}

function FeatureCard({ t, icon, iconBg, iconColor, title, sub }: any) {
  return (
    <View style={[styles.featureCard, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={[styles.featureIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.featureTitle, { color: t.text }]}>{title}</Text>
      <Text style={[styles.featureSub, { color: t.textSecondary }]}>{sub}</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const { t } = useTheme();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // Step 2
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');

  const completeOnboarding = async () => {
    await setStoredFlag('onboarding_completed', true);
    router.replace('/(admin)/dashboard');
  };

  const handleStep1 = async () => {
    if (!businessName.trim()) { Alert.alert('Errore', 'Il nome attività è obbligatorio.'); return; }
    setLoading(true);
    try {
      await api.post('/api/businesses', { name: businessName, businessType, address: businessAddress, isActive: true });
      setStep(2);
    } catch (e) {
      Alert.alert('Errore', apiError(e));
    } finally { setLoading(false); }
  };

  const handleStep2 = async () => {
    if (!firstName.trim() || !lastName.trim() || !empEmail.trim() || !empPassword) {
      Alert.alert('Errore', 'Tutti i campi del dipendente sono obbligatori.'); return;
    }
    setLoading(true);
    try {
      await api.post('/api/employees', { firstName, lastName, email: empEmail, password: empPassword, isActive: true });
      await completeOnboarding();
    } catch (e: any) {
      const status = e?.response?.status;
      Alert.alert('Errore', status === 400 ? 'Email già in uso.' : apiError(e));
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <Logo size={28} color={t.primary} textColor={t.text} />
        <TouchableOpacity onPress={completeOnboarding}>
          <Text style={[styles.skip, { color: t.textSecondary }]}>Salta</Text>
        </TouchableOpacity>
      </View>

      <ProgressDots t={t} total={3} current={step} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 0 — Welcome */}
        {step === 0 && (
          <View style={styles.step0}>
            <View style={styles.featureGrid}>
              <FeatureCard t={t} icon="cal" iconBg={t.primaryLight} iconColor={t.primary} title="Gestione turni" sub="Pianifica in pochi tap" />
              <FeatureCard t={t} icon="users" iconBg={t.kpiAmberBg} iconColor={t.kpiAmber} title="Il tuo team" sub="Tutti sulla stessa pagina" />
              <FeatureCard t={t} icon="palm" iconBg={t.kpiBlueBg} iconColor={t.kpiBlue} title="Ferie e permessi" sub="Approva con un tap" />
              <FeatureCard t={t} icon="bar" iconBg={t.kpiDangerBg} iconColor={t.danger} title="Report ore" sub="Esporta in CSV" />
            </View>
            <Text style={[styles.welcomeTitle, { color: t.text }]}>Benvenuto in TurniUp</Text>
            <Text style={[styles.welcomeSub, { color: t.textSecondary }]}>
              Configuriamo insieme la tua attività. Tre passi, due minuti.
            </Text>
          </View>
        )}

        {/* Step 1 — Business */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: t.text }]}>La tua attività</Text>
            <Text style={[styles.stepSub, { color: t.textSecondary }]}>Dicci dove lavora il tuo team.</Text>
            <View style={styles.form}>
              <Input t={t} label="Nome attività" value={businessName} onChangeText={setBusinessName}
                leadingIcon="building" autoCorrect={false} />
              <Input t={t} label="Tipo attività" value={businessType} onChangeText={setBusinessType}
                leadingIcon="briefcase" />
              <Input t={t} label="Indirizzo" value={businessAddress} onChangeText={setBusinessAddress}
                leadingIcon="pin" />
            </View>
          </View>
        )}

        {/* Step 2 — First employee */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: t.text }]}>Aggiungi il primo dipendente</Text>
            <Text style={[styles.stepSub, { color: t.textSecondary }]}>Potrai aggiungerne altri dal Profilo.</Text>
            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Input t={t} label="Nome" value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input t={t} label="Cognome" value={lastName} onChangeText={setLastName} />
                </View>
              </View>
              <Input t={t} label="Email" value={empEmail} onChangeText={setEmpEmail}
                keyboardType="email-address" autoCapitalize="none" leadingIcon="mail" />
              <Input t={t} label="Password temporanea" value={empPassword} onChangeText={setEmpPassword}
                secure leadingIcon="lock" helper="Sarà richiesta al primo accesso" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navRow}>
        {step > 0 && (
          <OutlineBtn t={t} onPress={() => setStep(s => s - 1)} full={false} style={{ flex: 1 }}>
            Indietro
          </OutlineBtn>
        )}
        <PrimaryBtn
          t={t}
          disabled={loading}
          style={{ flex: 2 }}
          onPress={
            step === 0 ? () => setStep(1)
            : step === 1 ? handleStep1
            : handleStep2
          }
        >
          {loading ? 'Salvataggio…' : step === 2 ? 'Crea dipendente' : step === 0 ? 'Inizia' : 'Avanti'}
        </PrimaryBtn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 0 },
  skip: { fontFamily: 'PlusJakartaSans-Medium', fontSize: 13 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 20 },
  dot: { height: 8, borderRadius: 4 },
  content: { paddingHorizontal: 24, paddingBottom: 8 },
  step0: { gap: 20 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  featureCard: {
    width: '47%', borderRadius: 16, padding: 20, borderWidth: 1,
    gap: 12,
  },
  featureIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  featureSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 11 },
  welcomeTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, letterSpacing: -0.4, lineHeight: 28 },
  welcomeSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, lineHeight: 22 },
  stepContent: { gap: 6 },
  stepTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, letterSpacing: -0.4 },
  stepSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, marginBottom: 16 },
  form: { gap: 14 },
  nameRow: { flexDirection: 'row', gap: 12 },
  navRow: { flexDirection: 'row', gap: 12, padding: 20, paddingTop: 16 },
});
