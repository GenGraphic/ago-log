import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

type Props = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  sensitive?: boolean;
  multiline?: boolean;
  rules?: object;
} & Omit<TextInputProps, 'style'>;

export default function FormTextInput({
  control,
  name,
  label,
  placeholder,
  sensitive,
  multiline,
  rules,
  ...rest
}: Props) {
  const icon = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#141C2A', dark: '#141C2A' }, 'background');

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <View style={styles.labelRow}>
            <ThemedText style={[styles.label, { color: icon }]}>{label}</ThemedText>
            {sensitive && (
              <View style={styles.sensitiveBadge}>
                <ThemedText style={styles.sensitiveText}>SENSITIVE</ThemedText>
              </View>
            )}
          </View>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: cardBg, color: text, borderColor: error ? '#FF6060' : `${icon}30` },
              multiline && styles.multiline,
            ]}
            placeholder={placeholder}
            placeholderTextColor={`${icon}60`}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            {...rest}
          />
          {error && (
            <ThemedText style={styles.error}>{error.message}</ThemedText>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  sensitiveBadge: {
    borderWidth: 1,
    borderColor: '#FF6060',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sensitiveText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#FF6060',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  error: {
    fontSize: 11,
    color: '#FF6060',
  },
});
