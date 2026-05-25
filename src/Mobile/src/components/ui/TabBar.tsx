import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeTokens, textOnPrimary } from '@/constants/tokens';
import { Icon, IconName } from './Icon';

type TabRole = 'admin' | 'employee';

interface Tab {
  label: string;
  icon: IconName;
}

const ADMIN_TABS: Tab[] = [
  { label: 'Dashboard', icon: 'home' },
  { label: 'Turni', icon: 'cal' },
  { label: 'Team', icon: 'users' },
  { label: 'Notifiche', icon: 'bell' },
  { label: 'Profilo', icon: 'user' },
];

const EMPLOYEE_TABS: Tab[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Turni', icon: 'cal' },
  { label: 'Ferie', icon: 'palm' },
  { label: 'Notifiche', icon: 'bell' },
  { label: 'Profilo', icon: 'user' },
];

interface TabBarProps {
  t: ThemeTokens;
  role?: TabRole;
  activeIndex?: number;
  onPress?: (index: number) => void;
  badge?: number[];
}

export function TabBar({ t, role = 'admin', activeIndex = 0, onPress, badge }: TabBarProps) {
  const tabs = role === 'admin' ? ADMIN_TABS : EMPLOYEE_TABS;
  const fg = textOnPrimary(t);

  return (
    <View style={[styles.container, { backgroundColor: t.surface, borderColor: t.border }]}>
      {tabs.map((tab, i) => {
        const active = i === activeIndex;
        const color = active ? fg : t.textSecondary;
        const hasBadge = badge?.[i] && badge[i] > 0;
        return (
          <TouchableOpacity
            key={i}
            style={[styles.tab, { backgroundColor: active ? t.primary : 'transparent' }]}
            onPress={() => onPress?.(i)}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrap}>
              <Icon name={tab.icon} size={20} color={color} />
              {hasBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge![i] > 9 ? '9+' : badge![i]}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 28,
    padding: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  iconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 9.5,
    letterSpacing: 0.1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#BA1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
