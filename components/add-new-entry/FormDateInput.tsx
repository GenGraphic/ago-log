import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';


type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  rules?: object;
};

/** Converts raw digit input to dd/mm/yyyy display format */
function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** dd/mm/yyyy → yyyy-mm-dd for storage */
function toISO(display: string): string {
  const parts = display.split('/');
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return display;
}

/** yyyy-mm-dd or ISO 8601 → dd/mm/yyyy for display */
function toDisplay(iso: string): string {
  // Handle full ISO 8601: 2026-04-09T00:00:00.000Z
  const isoMatch = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return iso;
}

export default function FormDateInput<T extends FieldValues>({ control, name, label, rules }: Props<T>) {
  const icon = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#E8E9EA', dark: '#141C2A' }, 'background');

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const display = value ? toDisplay(value) : '';

        return (
          <View style={styles.container}>
            <ThemedText style={[styles.label, { color: icon }]}>{label}</ThemedText>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: cardBg, borderColor: error ? '#FF6060' : `${icon}30` },
              ]}>
              <TextInput
                style={[styles.input, { color: text }]}
                placeholder="dd/mm/yyyy"
                placeholderTextColor={`${icon}60`}
                value={display}
                onChangeText={raw => {
                  const masked = applyMask(raw);
                  // Store as ISO once fully entered, otherwise keep display value
                  onChange(masked.length === 10 ? toISO(masked) : masked);
                }}
                onBlur={onBlur}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Feather name="calendar" size={16} color={`${icon}70`} />
            </View>
            {error && <ThemedText style={styles.error}>{error.message}</ThemedText>}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingRight: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  error: {
    fontSize: 11,
    color: '#FF6060',
  },
});
