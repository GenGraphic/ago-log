import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AppLanguage, AppTheme } from '@/store/slices/preferencesSlice';
import { RowDivider, SectionLabel, SettingRow, sharedStyles } from './shared';

const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  pt: 'Portuguese',
  es: 'Spanish',
};

const THEME_LABELS: Record<AppTheme, string> = {
  dark: 'DARK VOID',
  light: 'LIGHT',
  system: 'SYSTEM',
};

export function AppSettingsSection() {
  const dispatch = useAppDispatch();
  const { language, theme } = useAppSelector((s) => s.preferences);

  return (
    <>
      <SectionLabel title="APP SETTINGS" />
      <View style={sharedStyles.card}>
        <SettingRow label="Interface Language" value={LANGUAGE_LABELS[language]} onPress={() => {}} />
        <RowDivider />
        <SettingRow label="System Theme" value={THEME_LABELS[theme]} onPress={() => {}} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({});

