import React from "react";
import { View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { RowDivider, SectionLabel, SettingRow, sharedStyles } from "./shared";

export function DataSection() {
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );

  return (
    <>
      <SectionLabel title="DATA MANAGEMENT" />
      <View style={[sharedStyles.card, { backgroundColor: cardBg }]}>
        <SettingRow label="Export ledger account" onPress={() => {}} />
        <RowDivider />
        <SettingRow
          label="Delete account"
          onPress={() => {}}
          danger
          rightIcon="trash-2"
        />
      </View>
    </>
  );
}
