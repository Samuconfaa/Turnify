import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeTokens } from '@/constants/tokens';

interface AvatarProps {
  t: ThemeTokens;
  initials: string;
  size?: number;
  bg?: string;
  color?: string;
  ring?: string;
}

export function Avatar({ t, initials, size = 44, bg, color, ring }: AvatarProps) {
  return (
    <View style={[
      styles.base,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg ?? t.primaryLight,
        ...(ring ? { shadowColor: ring, shadowOffset: { width: 0, height: 0 }, shadowRadius: 0, shadowOpacity: 1, borderWidth: 2, borderColor: ring } : {}),
      },
    ]}>
      <Text style={[styles.text, { fontSize: Math.round(size * 0.32), color: color ?? t.primary }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: -0.2,
  },
});
