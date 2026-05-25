import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeTokens, textOnPrimary } from '@/constants/tokens';
import { Icon, IconName } from './Icon';

interface FABProps {
  t: ThemeTokens;
  icon?: IconName;
  onPress?: () => void;
}

export function FAB({ t, icon = 'plus', onPress }: FABProps) {
  const fg = textOnPrimary(t);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.base, { backgroundColor: t.primary }]}
    >
      <Icon name={icon} size={24} color={fg} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006948',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
