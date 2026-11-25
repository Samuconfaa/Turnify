import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Icon, PrimaryBtn, Toggle, Logo } from '@/components/ui';
import { setStoredFlag } from '@/hooks/useStoredFlag';

export default function GdprConsentScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!privacyAccepted) return;
    setLoading(true);
    await setStoredFlag('gdpr_consent_given', true);
    await setStoredFlag('gdpr_marketing_accepted', marketingAccepted);
    router.replace('/(auth)/role-selection');
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.logoRow}>
          <Logo size={36} color={t.primary} textColor={t.text} />
        </View>

        {/* Shield icon */}
        <View style={[styles.iconCircle, { backgroundColor: t.primaryLight }]}>
          <Icon name="shield" size={40} color={t.primary} strokeWidth={1.6} />
        </View>

        <Text style={[styles.title, { color: t.text }]}>Privacy e Consenso</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Prima di continuare ti chiediamo di leggere e accettare la nostra informativa sulla privacy, in conformità al GDPR.
        </Text>

        {/* Mandatory toggle */}
        <View style={[styles.toggleCard, { backgroundColor: t.surface, borderColor: privacyAccepted ? t.primary : t.border, borderWidth: privacyAccepted ? 2 : 1 }]}>
          <View style={styles.toggleLeft}>
            <Text style={[styles.toggleTitle, { color: t.text }]}>
              Informativa sulla Privacy <Text style={{ color: t.danger }}>*</Text>
            </Text>
            <Text style={[styles.toggleSub, { color: t.textSecondary }]}>
              Acconsento al trattamento dei miei dati personali per l'utilizzo del servizio.{' '}
              <Text
                style={{ color: t.primary, fontFamily: 'PlusJakartaSans-SemiBold' }}
                onPress={() => Linking.openURL('https://turniup.it/privacy')}>
                Leggi
              </Text>
            </Text>
          </View>
          <Toggle t={t} value={privacyAccepted} onValueChange={setPrivacyAccepted} />
        </View>

        {/* Optional toggle */}
        <View style={[styles.toggleCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={styles.toggleLeft}>
            <Text style={[styles.toggleTitle, { color: t.text }]}>Comunicazioni marketing</Text>
            <Text style={[styles.toggleSub, { color: t.textSecondary }]}>
              Acconsento a ricevere aggiornamenti e novità su TurniUp. Facoltativo.
            </Text>
          </View>
          <Toggle t={t} value={marketingAccepted} onValueChange={setMarketingAccepted} />
        </View>

        <Text style={[styles.note, { color: t.textSecondary }]}>
          * Campo obbligatorio. Senza il consenso alla privacy non è possibile utilizzare l'app.
        </Text>
      </ScrollView>

      {/* Bottom */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryBtn
          t={t}
          disabled={!privacyAccepted || loading}
          onPress={handleAccept}
        >
          Accetta e continua
        </PrimaryBtn>
        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => Linking.openURL('https://turniup.it/termini')}>
            <Text style={[styles.link, { color: t.textSecondary }]}>Termini di servizio</Text>
          </TouchableOpacity>
          <Text style={{ color: t.border }}> · </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://turniup.it/privacy')}>
            <Text style={[styles.link, { color: t.textSecondary }]}>Privacy policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 8, gap: 16 },
  logoRow: { alignItems: 'center', marginBottom: 8 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24, letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14, lineHeight: 21, textAlign: 'center',
  },
  toggleCard: {
    borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  toggleLeft: { flex: 1, gap: 4 },
  toggleTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15 },
  toggleSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, lineHeight: 18 },
  note: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, lineHeight: 17 },
  bottom: { paddingHorizontal: 24, paddingTop: 8, gap: 12 },
  linksRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  link: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12 },
});
