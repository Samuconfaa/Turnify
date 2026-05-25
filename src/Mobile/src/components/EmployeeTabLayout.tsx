import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { TabBar } from '@/components/ui';

const TAB_ROUTES = [
  '/(employee)/dashboard',
  '/(employee)/shifts',
  '/(employee)/vacations',
  '/(employee)/notifications',
  '/(employee)/profile',
] as const;

const TAB_PATHNAMES = ['/dashboard', '/shifts', '/vacations', '/notifications', '/profile'] as const;

interface Props {
  children: React.ReactNode;
}

export function EmployeeTabLayout({ children }: Props) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const activeIndex = Math.max(
    0,
    TAB_PATHNAMES.findIndex(r => pathname === r || pathname.startsWith(r + '/')),
  );

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.content}>{children}</View>
      <View style={[styles.barWrap, { paddingBottom: insets.bottom + 8, backgroundColor: t.bg }]}>
        <TabBar
          t={t}
          role="employee"
          activeIndex={activeIndex}
          onPress={i => router.replace(TAB_ROUTES[i] as any)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  barWrap: { paddingHorizontal: 16, paddingTop: 8 },
});
