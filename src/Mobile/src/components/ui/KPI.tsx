import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';

interface KPIProps {
  label: string;
  value: string | number;
  icon: IconName;
  bg: string;
  fg: string;
  dark?: boolean;
}

export function KPI({ label, value, icon, bg, fg, dark }: KPIProps) {
  const borderColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  return (
    <View style={[styles.base, { backgroundColor: bg, borderColor }]}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Icon name={icon} size={14} color={fg} strokeWidth={2} />
        </View>
      </View>
      <View>
        <Text style={[styles.value, { color: fg }]}>{value}</Text>
        <Text style={[styles.label, { color: fg }]} numberOfLines={2}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 110,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  label: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    marginTop: 6,
    opacity: 0.9,
    letterSpacing: -0.1,
  },
});
