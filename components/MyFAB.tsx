import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface MyFABProps {
  onPress: () => void;
  icon?: FeatherIconName;
  size?: number;
  bottom?: number;
  right?: number;
  disabled?: boolean;
  backgroundColor?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export default function MyFAB({
  onPress,
  icon = 'plus',
  size = 56,
  bottom = 28,
  right = 20,
  disabled = false,
  backgroundColor,
  iconColor,
  style,
  accessibilityLabel,
}: MyFABProps) {
  const tint = useThemeColor({}, 'tint');
  const screenBg = useThemeColor({}, 'background');

  const fabSize = size;
  const iconSize = Math.max(18, Math.round(size * 0.48));
  const bg = backgroundColor ?? tint;
  const fg = iconColor ?? screenBg;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        {
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          right,
          bottom,
          backgroundColor: bg,
          shadowColor: bg,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      <Feather name={icon} size={iconSize} color={fg} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
});
