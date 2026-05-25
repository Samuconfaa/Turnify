import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeTokens } from '@/constants/tokens';

interface HeaderProps {
  t: ThemeTokens;
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  dense?: boolean;
}

export function Header({ t, title, subtitle, leading, trailing, dense = false }: HeaderProps) {
  return (
    <View style={[styles.base, { borderBottomColor: t.border, backgroundColor: t.surface, paddingVertical: dense ? 10 : 8 }]}>
      <View style={styles.row}>
        {leading}
        <View style={styles.titleArea}>
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: t.textSecondary }]}>{subtitle}</Text>}
        </View>
        {trailing}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 32,
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    marginTop: 2,
  },
});
