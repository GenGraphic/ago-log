import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AssetType } from '@/models/enums';

export type AssetFilterKey = 'ALL' | AssetType;

const FILTERS: AssetFilterKey[] = [
  'ALL',
  AssetType.VEHICLE,
  AssetType.HOME,
  AssetType.LAND,
  AssetType.BUSINESS,
  AssetType.PERSONAL,
  AssetType.OTHER,
];

type Props = {
  selected: AssetFilterKey;
  onSelect: (key: AssetFilterKey) => void;
};

export default function AssetTypeFilter({ selected, onSelect }: Props) {
  const { t } = useTranslation();
  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const cardBg = useThemeColor({ light: '#E8E9EA', dark: '#141C2A' }, 'background');

  const getLabel = (key: AssetFilterKey) => {
    if (key === 'ALL') return t('assets.filterAll');
    return t(`assets.type.${key}`);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FILTERS.map((key) => {
        const active = selected === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.chip,
              {
                borderColor: active ? tint : `${icon}20`,
                backgroundColor: active ? tint : cardBg,
              },
            ]}
            onPress={() => onSelect(key)}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.chipText, { color: active ? '#00363A' : icon }]}>
              {getLabel(key)}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
