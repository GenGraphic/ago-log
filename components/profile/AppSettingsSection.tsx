import React from "react";
import { Alert, StyleSheet, View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    AppLanguage,
    AppTheme,
    setTheme,
} from "@/store/slices/preferencesSlice";
import { RowDivider, SectionLabel, SettingRow, sharedStyles } from "./shared";

const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: "English",
  pt: "Portuguese",
  es: "Spanish",
};

const THEME_LABELS: Record<AppTheme, string> = {
  dark: "DARK VOID",
  light: "LIGHT",
  system: "SYSTEM",
};

export function AppSettingsSection() {
  const dispatch = useAppDispatch();
  const { language, theme } = useAppSelector((s) => s.preferences);
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );

  const THEME_OPTIONS: AppTheme[] = ["system", "dark", "light"];

  const handleThemePress = () => {
    Alert.alert("Select Theme", "Choose your preferred theme", [
      ...THEME_OPTIONS.map((option) => ({
        text: THEME_LABELS[option],
        onPress: () => dispatch(setTheme(option)),
      })),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  return (
    <>
      <SectionLabel title="APP SETTINGS" />
      <View style={[sharedStyles.card, { backgroundColor: cardBg }]}>
        <SettingRow
          label="Interface Language"
          value={LANGUAGE_LABELS[language]}
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "Language selection will be available in a future update.",
            );
          }}
        />
        <RowDivider />
        <SettingRow
          label="System Theme"
          value={THEME_LABELS[theme]}
          onPress={handleThemePress}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({});
