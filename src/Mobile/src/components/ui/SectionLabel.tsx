import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ThemeTokens } from '@/constants/tokens';

interface SectionLabelProps {
  t: ThemeTokens;
  children: React.ReactNode;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionLabel({ t, children, action, onAction, style }: SectionLabelProps) {
  return (
    <View style={[styles.base, style]}>
      <Text style={[styles.label, { color: t.textSecondary }]}>{children}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.action, { color: t.primary }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  label: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  action: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
  },
});
