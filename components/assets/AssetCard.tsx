import { useThemeColor } from '@/hooks/useThemeColor';
import { Asset } from '@/models/assets';
import { AssetType } from '@/models/enums';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

interface AssetCardProps {
  item: Asset;
  onPress?: () => void;
  linkedEntriesLabel?: string;
}

const TYPE_ICON_MAP: Record<AssetType, React.ComponentProps<typeof Feather>['name']> = {
  [AssetType.VEHICLE]: 'truck',
  [AssetType.HOME]: 'home',
  [AssetType.LAND]: 'map',
  [AssetType.PERSONAL]: 'user',
  [AssetType.BUSINESS]: 'briefcase',
  [AssetType.OTHER]: 'box',
};

const TYPE_COLOR_MAP: Record<AssetType, string> = {
  [AssetType.VEHICLE]: '#3DB8FF',
  [AssetType.HOME]: '#22C55E',
  [AssetType.LAND]: '#84CC16',
  [AssetType.PERSONAL]: '#F59E0B',
  [AssetType.BUSINESS]: '#A78BFA',
  [AssetType.OTHER]: '#94A3B8',
};

export default function AssetCard({ item, onPress, linkedEntriesLabel }: AssetCardProps) {
  const icon = useThemeColor({}, 'icon');
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#141C2A' }, 'background');

  const accentColor = TYPE_COLOR_MAP[item.type] ?? '#94A3B8';
  const secondaryText = linkedEntriesLabel || item.description?.trim() || item.type.toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: cardBg }]}
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <View style={[styles.iconBox, { backgroundColor: `${accentColor}18` }]}>
        <Feather name={TYPE_ICON_MAP[item.type] ?? 'box'} size={20} color={accentColor} />
      </View>

      <View style={styles.textBlock}>
        <ThemedText style={styles.title} numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText style={[styles.subtitle, { color: `${icon}80` }]} numberOfLines={1}>
          {secondaryText}
        </ThemedText>
      </View>

      <View style={styles.right}>
        <Feather name="chevron-right" size={18} color={`${icon}80`} />
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  accent: {
    width: 3,
    height: 44,
    borderRadius: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  right: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
