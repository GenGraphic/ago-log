import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const PRESETS = [12, 24, 36, 60];

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

/** Warranty length in months (stored as a string, like the other number fields). */
export default function WarrantyMonthsChips<T extends FieldValues>({ control, name }: Props<T>) {
  const { t } = useTranslation();
  const [showCustom, setShowCustom] = useState(false);

  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#E8E9EA', dark: '#141C2A' }, 'background');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const months = parseInt(value ?? '', 10);
        const isCustom = months > 0 && !PRESETS.includes(months);

        return (
          <View style={styles.container}>
            <ThemedText style={[styles.label, { color: icon }]}>{t('warranty.monthsLabel')}</ThemedText>

            <View style={styles.chipsRow}>
              {PRESETS.map(m => {
                const active = months === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.chip,
                      { borderColor: active ? tint : `${icon}30` },
                      active && { backgroundColor: `${tint}20` },
                    ]}
                    onPress={() => {
                      onChange(String(m));
                      setShowCustom(false);
                    }}
                    activeOpacity={0.7}>
                    <ThemedText style={[styles.chipText, { color: active ? tint : icon }]}>
                      {t('warranty.months', { count: m })}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[
                  styles.chip,
                  { borderColor: isCustom || showCustom ? tint : `${icon}30`, backgroundColor: cardBg },
                ]}
                onPress={() => setShowCustom(v => !v)}
                activeOpacity={0.7}>
                <ThemedText style={[styles.chipText, { color: isCustom ? tint : icon }]}>
                  {isCustom ? t('warranty.months', { count: months }) : t('notifications.custom')}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {showCustom && (
              <TextInput
                style={[styles.customInput, { borderColor: `${icon}30`, color: text, backgroundColor: cardBg }]}
                placeholder={t('warranty.customPlaceholder')}
                placeholderTextColor={`${icon}50`}
                keyboardType="number-pad"
                value={isCustom ? String(months) : ''}
                onChangeText={v => onChange(v.replace(/\D/g, ''))}
                onSubmitEditing={() => setShowCustom(false)}
                returnKeyType="done"
                autoFocus
              />
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
});
