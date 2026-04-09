import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

type MethodCardProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  highlighted?: boolean;
};

export default function MethodCard({ icon, title, subtitle, onPress, highlighted = false }: MethodCardProps) {
  const tint = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const cardBg = useThemeColor({ light: '#1A2235', dark: '#1C2333' }, 'background');

  const iconBoxBg = highlighted ? `${tint}18` : `${iconColor}22`;
  const activeIconColor = highlighted ? tint : iconColor;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: cardBg },
        highlighted && { borderColor: tint, borderWidth: 1 },
      ]}
      activeOpacity={0.8}
      onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: iconBoxBg }]}>
        <Feather name={icon} size={26} color={activeIconColor} />
      </View>
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      <ThemedText style={[styles.cardSub, { color: iconColor }]}>{subtitle}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardSub: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});
