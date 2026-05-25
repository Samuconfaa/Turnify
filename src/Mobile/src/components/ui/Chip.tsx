import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { ThemeTokens, textOnPrimary } from '@/constants/tokens';

interface ChipProps {
  t: ThemeTokens;
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Chip({ t, label, active, onPress, style }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.base,
        { backgroundColor: active ? t.primary : t.surfaceLow },
        style,
      ]}
    >
      <Text style={[styles.text, { color: active ? textOnPrimary(t) : t.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    letterSpacing: -0.1,
  },
});
