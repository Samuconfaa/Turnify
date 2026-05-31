import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
  textColor?: string;
  withText?: boolean;
}

export function Logo({ size = 40, color = '#006948', textColor = '#171D19', withText = true }: LogoProps) {
  const iconSize = size * 0.55;
  return (
    <View style={styles.row}>
      <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: color }]}>
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 6.5a2 2 0 012-2h8l6 6v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-11z"
            fill="#fff"
            fillOpacity={0.95}
          />
          <Path
            d="M12 8v4l3 2"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      {withText && (
        <Text style={[styles.name, { fontSize: size * 0.5, color: textColor }]}>TurniUp</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: {
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: -0.6,
  },
});
