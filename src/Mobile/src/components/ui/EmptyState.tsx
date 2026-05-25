import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeTokens } from '@/constants/tokens';
import { Icon, IconName } from './Icon';

interface EmptyStateProps {
  t: ThemeTokens;
  icon?: IconName;
  title: string;
  body?: string;
  action?: React.ReactNode;
}

export function EmptyState({ t, icon = 'bell', title, body, action }: EmptyStateProps) {
  return (
    <View style={styles.base}>
      <View style={[styles.iconCircle, { backgroundColor: t.surfaceLow }]}>
        <Icon name={icon} size={28} color={t.textSecondary} strokeWidth={1.6} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        {body && <Text style={[styles.body, { color: t.textSecondary }]}>{body}</Text>}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    padding: 40,
    paddingHorizontal: 24,
    gap: 14,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 17,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
