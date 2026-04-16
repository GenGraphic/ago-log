import { useThemeColor } from "@/hooks/useThemeColor";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../ThemedText";

export function SectionLabel({ title }: { title: string }) {
  const color = useThemeColor({ light: "#444", dark: "#888" }, "icon");
  return <Text style={[styles.sectionLabel, { color }]}>{title}</Text>;
}

export function RowDivider() {
  const dividerBg = useThemeColor(
    { light: "#E5E7EB", dark: "#1A1A1A" },
    "icon",
  );
  return <View style={[styles.divider, { backgroundColor: dividerBg }]} />;
}

export function SettingRow({
  label,
  value,
  onPress,
  danger = false,
  rightIcon = "chevron-right",
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  rightIcon?: React.ComponentProps<typeof Feather>["name"];
}) {
  const mutedColor = useThemeColor({ light: "#555", dark: "#999" }, "icon");
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <ThemedText style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </ThemedText>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rowValue, { color: mutedColor }]}>{value}</Text>
        ) : null}
        <Feather
          name={rightIcon}
          size={14}
          color={danger ? "#FF6060" : mutedColor}
        />
      </View>
    </TouchableOpacity>
  );
}

export const sharedStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
});

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  rowLabelDanger: {
    color: "#FF6060",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 12,
  },
});
