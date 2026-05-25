import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeTokens } from '@/constants/tokens';
import { Icon, IconName } from './Icon';

interface SettingsRowProps {
  t: ThemeTokens;
  icon?: IconName;
  iconBg?: string;
  iconColor?: string;
  title: string;
  trailing?: React.ReactNode;
  last?: boolean;
  danger?: boolean;
  onPress?: () => void;
}

export function SettingsRow({ t, icon, iconBg, iconColor, title, trailing, last, danger, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.base, !last && { borderBottomWidth: 1, borderBottomColor: t.borderSoft }]}
    >
      {icon && (
        <View style={[styles.iconBox, { backgroundColor: iconBg ?? t.surfaceLow }]}>
          <Icon name={icon} size={18} color={iconColor ?? t.text} />
        </View>
      )}
      <Text style={[styles.title, { color: danger ? t.danger : t.text, flex: 1 }]}>{title}</Text>
      {trailing ?? <Icon name="chev-r" size={18} color={t.textSecondary} strokeWidth={2} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
  },
});
