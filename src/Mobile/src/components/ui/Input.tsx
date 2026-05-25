import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeTokens } from '@/constants/tokens';
import { Icon, IconName } from './Icon';

interface InputProps extends Omit<TextInputProps, 'style'> {
  t: ThemeTokens;
  label?: string;
  helper?: string;
  error?: string;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  onTrailingPress?: () => void;
  secure?: boolean;
}

export function Input({ t, label, helper, error, leadingIcon, trailingIcon, onTrailingPress, secure, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure ?? false);

  const borderColor = error ? t.danger : focused ? t.primary : t.border;
  const borderWidth = focused || error ? 2 : 1;
  const offset = focused || error ? 13 : 14;

  return (
    <View>
      {label && (
        <View style={[styles.labelBg, { backgroundColor: t.surface }]}>
          <Text style={[styles.label, { color: focused ? t.primary : t.textSecondary }]}>{label}</Text>
        </View>
      )}
      <View style={[styles.field, { borderColor, borderWidth, backgroundColor: t.surface, paddingHorizontal: offset }]}>
        {leadingIcon && <Icon name={leadingIcon} size={18} color={t.textSecondary} />}
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          placeholderTextColor={t.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: t.text, flex: 1 }]}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setHidden(h => !h)}>
            <Icon name={hidden ? 'eye' : 'lock'} size={18} color={t.textSecondary} />
          </TouchableOpacity>
        ) : trailingIcon ? (
          <TouchableOpacity onPress={onTrailingPress}>
            <Icon name={trailingIcon} size={18} color={t.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {(helper || error) && (
        <Text style={[styles.helper, { color: error ? t.danger : t.textSecondary }]}>{error ?? helper}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelBg: {
    position: 'absolute',
    top: -7,
    left: 14,
    paddingHorizontal: 6,
    zIndex: 1,
  },
  label: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  field: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    height: '100%',
  },
  helper: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    marginTop: 6,
    paddingLeft: 4,
  },
});
