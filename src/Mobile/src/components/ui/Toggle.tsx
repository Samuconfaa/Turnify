import React from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import { ThemeTokens } from '@/constants/tokens';

interface ToggleProps {
  t: ThemeTokens;
  value: boolean;
  onValueChange?: (v: boolean) => void;
}

export function Toggle({ t, value, onValueChange }: ToggleProps) {
  return (
    <Pressable onPress={() => onValueChange?.(!value)}>
      <View style={[styles.track, { backgroundColor: value ? t.primary : t.border }]}>
        <View style={[styles.thumb, { transform: [{ translateX: value ? 18 : 0 }] }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});
