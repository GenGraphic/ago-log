import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const PRESETS = [1, 7, 30];

type Props = {
  control: Control<any>;
  name: string;
};

export default function NotifyChips({ control, name }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#141C2A', dark: '#141C2A' }, 'background');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const selected: number[] = value ?? [];

        const toggle = (day: number) => {
          if (selected.includes(day)) {
            onChange(selected.filter(d => d !== day));
          } else {
            onChange([...selected, day].sort((a, b) => a - b));
          }
        };

        const confirmCustom = () => {
          const num = parseInt(customInput, 10);
          if (num > 0 && !selected.includes(num)) {
            onChange([...selected, num].sort((a, b) => a - b));
          }
          setCustomInput('');
          setShowCustom(false);
        };

        return (
          <View style={styles.container}>
            <ThemedText style={[styles.label, { color: icon }]}>NOTIFY DAYS BEFORE</ThemedText>

            <View style={styles.chipsRow}>
              {PRESETS.map(day => {
                const active = selected.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.chip,
                      { borderColor: active ? tint : `${icon}30` },
                      active && { backgroundColor: `${tint}20` },
                    ]}
                    onPress={() => toggle(day)}
                    activeOpacity={0.7}>
                    <ThemedText style={[styles.chipText, { color: active ? tint : icon }]}>
                      {day}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}

              {/* Custom chips already added */}
              {selected
                .filter(d => !PRESETS.includes(d))
                .map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.chip, { borderColor: tint, backgroundColor: `${tint}20` }]}
                    onPress={() => toggle(day)}
                    activeOpacity={0.7}>
                    <ThemedText style={[styles.chipText, { color: tint }]}>{day}</ThemedText>
                    <Feather name="x" size={11} color={tint} />
                  </TouchableOpacity>
                ))}

              <TouchableOpacity
                style={[styles.chip, styles.customBtn, { borderColor: `${icon}30`, backgroundColor: cardBg }]}
                onPress={() => setShowCustom(v => !v)}
                activeOpacity={0.7}>
                <Feather name="plus" size={12} color={icon} />
                <ThemedText style={[styles.chipText, { color: icon }]}>Custom</ThemedText>
              </TouchableOpacity>
            </View>

            {showCustom && (
              <View style={styles.customRow}>
                <TextInput
                  style={[styles.customInput, { borderColor: `${icon}30`, color: text, backgroundColor: cardBg }]}
                  placeholder="e.g. 14"
                  placeholderTextColor={`${icon}50`}
                  keyboardType="number-pad"
                  value={customInput}
                  onChangeText={setCustomInput}
                  onSubmitEditing={confirmCustom}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: tint }]}
                  onPress={confirmCustom}>
                  <Feather name="check" size={16} color="#000" />
                </TouchableOpacity>
              </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  customBtn: {
    paddingHorizontal: 12,
  },
  customRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  confirmBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
