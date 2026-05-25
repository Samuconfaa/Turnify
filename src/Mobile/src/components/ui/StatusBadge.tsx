import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeTokens, textOnPrimary } from '@/constants/tokens';

type BadgeKind = 'approved' | 'pending' | 'rejected' | 'today' | 'active' | 'inactive' | 'cancelled';

interface StatusBadgeProps {
  t: ThemeTokens;
  kind?: BadgeKind;
  label?: string;
  dot?: boolean;
}

export function StatusBadge({ t, kind = 'pending', label, dot }: StatusBadgeProps) {
  const map: Record<BadgeKind, { bg: string; color: string; def: string }> = {
    approved: { bg: t.successBg, color: t.successText, def: 'Approvato' },
    pending: { bg: t.warningBg, color: t.warningText, def: 'In attesa' },
    rejected: { bg: t.errorBg, color: t.errorText, def: 'Rifiutato' },
    cancelled: { bg: t.errorBg, color: t.errorText, def: 'Annullato' },
    today: { bg: t.primary, color: textOnPrimary(t), def: 'Oggi' },
    active: { bg: t.successBg, color: t.successText, def: 'Attivo' },
    inactive: { bg: t.surfaceLow, color: t.textSecondary, def: 'Inattivo' },
  };
  const s = map[kind] ?? map.pending;

  return (
    <View style={[styles.base, { backgroundColor: s.bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: s.color }]} />}
      <Text style={[styles.text, { color: s.color }]}>{label ?? s.def}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    letterSpacing: -0.1,
  },
});
