import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, View } from "react-native";

type Props = { title: string };

export default function NotificationSectionHeader({ title }: Props) {
  const lineColor = useThemeColor(
    { light: "#E5E7EB", dark: "#1E1E1E" },
    "icon",
  );

  return (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{title}</ThemedText>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#444",
    letterSpacing: 1.2,
    flexShrink: 0,
  },
  line: { flex: 1, height: 1 },
});
