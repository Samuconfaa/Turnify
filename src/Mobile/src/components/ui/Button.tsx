import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle } from 'react-native';
import { ThemeTokens, textOnPrimary } from '@/constants/tokens';
import { Icon, IconName } from './Icon';

interface BtnProps {
  t: ThemeTokens;
  children: React.ReactNode;
  onPress?: () => void;
  full?: boolean;
  height?: number;
  style?: ViewStyle;
  disabled?: boolean;
  leadingIcon?: IconName;
}

export function PrimaryBtn({ t, children, onPress, full = true, height = 50, style, disabled, leadingIcon }: BtnProps) {
  const fg = textOnPrimary(t);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        { height, backgroundColor: t.primary, width: full ? '100%' : undefined, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
    >
      {leadingIcon && <Icon name={leadingIcon} size={18} color={fg} />}
      <Text style={[styles.label, { color: fg }]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function OutlineBtn({ t, children, onPress, full = true, height = 50, style, disabled, leadingIcon }: BtnProps & { color?: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        { height, backgroundColor: 'transparent', borderWidth: 1, borderColor: t.primary, width: full ? '100%' : undefined, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
    >
      {leadingIcon && <Icon name={leadingIcon} size={18} color={t.primary} />}
      <Text style={[styles.label, { color: t.primary }]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function DangerBtn({ t, children, onPress, full = true, height = 50, outline = true, style, disabled }: BtnProps & { outline?: boolean }) {
  if (outline) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.base, { height, backgroundColor: 'transparent', borderWidth: 1, borderColor: t.danger, width: full ? '100%' : undefined, opacity: disabled ? 0.6 : 1 }, style]}
      >
        <Text style={[styles.label, { color: t.danger }]}>{children}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.base, { height, backgroundColor: t.danger, width: full ? '100%' : undefined, opacity: disabled ? 0.6 : 1 }, style]}
    >
      <Text style={[styles.label, { color: '#fff' }]}>{children}</Text>
    </TouchableOpacity>
  );
}

interface PillProps {
  children: React.ReactNode;
  bg: string;
  color: string;
  style?: ViewStyle;
}

export function SmallPill({ children, bg, color, style }: PillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.pillText, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    letterSpacing: -0.1,
  },
  pill: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
  },
});
