import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ThemeTokens } from '@/constants/tokens';

interface AvatarProps {
  t: ThemeTokens;
  initials: string;
  size?: number;
  bg?: string;
  color?: string;
  ring?: string;
  uri?: string;
}

export function Avatar({ t, initials, size = 44, bg, color, ring, uri }: AvatarProps) {
  const ringStyle = ring
    ? { shadowColor: ring, shadowOffset: { width: 0, height: 0 }, shadowRadius: 0, shadowOpacity: 1, borderWidth: 2, borderColor: ring }
    : {};
  const radius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, { width: size, height: size, borderRadius: radius, ...ringStyle }]}
      />
    );
  }

  return (
    <View style={[
      styles.base,
      {
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: bg ?? t.primaryLight,
        ...ringStyle,
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
