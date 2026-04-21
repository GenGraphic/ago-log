import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    AppLanguage,
    AppTheme,
    setLanguage,
    setTheme,
} from "@/store/slices/preferencesSlice";
import { RowDivider, SectionLabel, SettingRow, sharedStyles } from "./shared";

export function AppSettingsSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { language, theme } = useAppSelector((s) => s.preferences);
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );

  const LANGUAGE_LABELS: Record<AppLanguage, string> = {
    en: t("profile.langEnglish"),
    ro: t("profile.langRomanian"),
  };

  const THEME_LABELS: Record<AppTheme, string> = {
    dark: t("profile.themeDark"),
    light: t("profile.themeLight"),
    system: t("profile.themeSystem"),
  };

  const THEME_OPTIONS: AppTheme[] = ["system", "dark", "light"];
  const LANGUAGE_OPTIONS: AppLanguage[] = ["en", "ro"];

  const handleThemePress = () => {
    Alert.alert(t("profile.selectTheme"), t("profile.chooseTheme"), [
      ...THEME_OPTIONS.map((option) => ({
        text: THEME_LABELS[option],
        onPress: () => dispatch(setTheme(option)),
      })),
      { text: t("common.cancel"), style: "cancel" as const },
    ]);
  };

  const handleLanguagePress = () => {
    Alert.alert(t("profile.interfaceLanguage"), undefined, [
      ...LANGUAGE_OPTIONS.map((option) => ({
        text: LANGUAGE_LABELS[option],
        onPress: () => dispatch(setLanguage(option)),
      })),
      { text: t("common.cancel"), style: "cancel" as const },
    ]);
  };

  return (
    <>
      <SectionLabel title={t("profile.appSettings")} />
      <View style={[sharedStyles.card, { backgroundColor: cardBg }]}>
        <SettingRow
          label={t("profile.interfaceLanguage")}
          value={LANGUAGE_LABELS[language]}
          onPress={handleLanguagePress}
        />
        <RowDivider />
        <SettingRow
          label={t("profile.systemTheme")}
          value={THEME_LABELS[theme]}
          onPress={handleThemePress}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({});
