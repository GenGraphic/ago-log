import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Props {
  days: number;
  color: string;
  expiryLabel: string;
  expiryDateFormatted: string;
}

export function CountdownCard({ days, color, expiryLabel, expiryDateFormatted }: Props) {
  const icon = useThemeColor({}, "icon");

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <ThemedText style={[styles.number, { color }]}>
        {days < 0 ? Math.abs(days) : days}
      </ThemedText>
      <ThemedText style={[styles.label, { color: `${icon}99` }]}>
        {days < 0 ? "days overdue" : "days remaining"}
      </ThemedText>
      <ThemedText style={[styles.date, { color: icon }]}>
        {expiryLabel}: {expiryDateFormatted}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 2,
  },
  number: { fontSize: 40, fontWeight: "800", lineHeight: 44 },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  date: { fontSize: 12, marginTop: 4 },
});
