import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  const { t } = useTranslation();
  const icon = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#E8E9EA', dark: '#141C2A' }, 'background');

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <Feather name="search" size={16} color={`${icon}80`} />
      <TextInput
        style={[styles.input, { color: text }]}
        placeholder={placeholder ?? t('entries.searchPlaceholder')}
        placeholderTextColor={`${icon}60`}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
});
