import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "../ThemedText";
import { RowDivider, SectionLabel, SettingRow, sharedStyles } from "./shared";

export function SecuritySection() {
  const { t } = useTranslation();
  const router = useRouter();
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );

  return (
    <>
      <SectionLabel title={t('profile.security')} />
      <View style={[sharedStyles.card, { backgroundColor: cardBg }]}>
        <SettingRow
          label={t('profile.twoFA')}
          onPress={() => router.push("/(main)/mfa-setup")}
        />
        <RowDivider />
        <View style={styles.infoBox}>
          <Feather
            name="info"
            size={14}
            color="#00F0FF"
            style={{ marginTop: 1 }}
          />
          <ThemedText style={styles.infoText}>
            {t('profile.encryptionText')}
          </ThemedText>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    flexDirection: "row",
    gap: 8,
    margin: 14,
    padding: 12,
    backgroundColor: "rgba(0,240,255,0.05)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,240,255,0.12)",
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: "#555",
    lineHeight: 17,
  },
});
