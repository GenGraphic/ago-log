import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "../ThemedText";
import { RowDivider, SectionLabel, SettingRow, sharedStyles } from "./shared";

export function SecuritySection() {
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );

  return (
    <>
      <SectionLabel title="SECURITY" />
      <View style={[sharedStyles.card, { backgroundColor: cardBg }]}>
        <SettingRow label="2FA Authentication" onPress={() => {}} />
        <RowDivider />
        <View style={styles.infoBox}>
          <Feather
            name="info"
            size={14}
            color="#00F0FF"
            style={{ marginTop: 1 }}
          />
          <ThemedText style={styles.infoText}>
            Your account uses military-grade AES-256 encryption to protect your
            personal data and credentials at all times.
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
