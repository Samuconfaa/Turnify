import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeTokens, textOnPrimary } from '@/constants/tokens';

interface HeroProps {
  t: ThemeTokens;
  children: React.ReactNode;
  height?: number;
  style?: ViewStyle;
}

export function Hero({ t, children, height = 220, style }: HeroProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[
      styles.base,
      { backgroundColor: t.primary, minHeight: height, paddingTop: insets.top + 16 },
      style,
    ]}>
      {children}
    </View>
  );
}

export function DragHandle({ t }: { t: ThemeTokens }) {
  return (
    <View style={styles.dragWrap}>
      <View style={[styles.handle, { backgroundColor: t.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dragWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
});
