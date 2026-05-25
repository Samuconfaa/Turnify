import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ThemeTokens } from '@/constants/tokens';

interface CardProps {
  t: ThemeTokens;
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
  accent?: string;
}

export function Card({ t, children, style, onPress, padding = 16, accent }: CardProps) {
  const inner = (
    <View style={[styles.base, { backgroundColor: t.surface, borderColor: t.border, padding }, style]}>
      {accent && <View style={[styles.accent, { backgroundColor: accent }]} />}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
});
