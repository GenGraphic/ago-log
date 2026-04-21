import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export type CategoryKey = 'ALL' | 'EXPIRED' | 'UPCOMING' | 'INSURANCE' | 'DOCUMENTS' | 'VEHICLE' | 'MEDICAL' | 'LEGAL' | 'PERSONAL' | 'SECURE';

const CATEGORIES: CategoryKey[] = [
  'ALL', 'EXPIRED', 'UPCOMING', 'INSURANCE', 'DOCUMENTS', 'VEHICLE', 'MEDICAL', 'LEGAL', 'PERSONAL', 'SECURE',
];

type Props = {
  selected: CategoryKey;
  onSelect: (key: CategoryKey) => void;
};

export default function CategoryFilter({ selected, onSelect }: Props) {
  const { t } = useTranslation();
  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const cardBg = useThemeColor({ light: '#E8E9EA', dark: '#141C2A' }, 'background');

  const CATEGORY_LABELS: Record<CategoryKey, string> = {
    ALL:       t('entries.filterAll'),
    EXPIRED:   t('entries.filterExpired'),
    UPCOMING:  t('entries.filterUpcoming'),
    INSURANCE: t('entries.filterInsurance'),
    DOCUMENTS: t('entries.filterDocuments'),
    VEHICLE:   t('entries.filterVehicle'),
    MEDICAL:   t('entries.filterMedical'),
    LEGAL:     t('entries.filterLegal'),
    PERSONAL:  t('entries.filterPersonal'),
    SECURE:    t('entries.filterSecure'),
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {CATEGORIES.map(cat => {
        const active = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              { borderColor: active ? tint : `${icon}20`, backgroundColor: active ? tint : cardBg },
            ]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.7}>
            <ThemedText style={[styles.chipText, { color: active ? '#00363A' : icon }]}>
              {CATEGORY_LABELS[cat]}
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
