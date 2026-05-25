import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getStoredFlag } from '@/hooks/useStoredFlag';
import { useTheme } from '@/context/ThemeContext';

type Dest =
  | '/(auth)/gdpr-consent'
  | '/(auth)/role-selection'
  | '/(auth)/onboarding'
  | '/(admin)/dashboard'
  | '/(employee)/dashboard'
  | null;

export default function Index() {
  const { user, isLoading } = useAuth();
  const { t } = useTheme();
  const [dest, setDest] = useState<Dest>(null);

  useEffect(() => {
    if (isLoading) return;
    (async () => {
      const gdprGiven = await getStoredFlag('gdpr_consent_given', false);
      if (!gdprGiven) { setDest('/(auth)/gdpr-consent'); return; }

      if (!user) { setDest('/(auth)/role-selection'); return; }

      if (user.role === 'Admin') {
        const onboardingDone = await getStoredFlag('onboarding_completed', false);
        if (!onboardingDone) { setDest('/(auth)/onboarding'); return; }
        setDest('/(admin)/dashboard');
      } else {
        setDest('/(employee)/dashboard');
      }
    })();
  }, [isLoading, user]);

  if (isLoading || dest === null) {
    return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  }

  return <Redirect href={dest} />;
}
