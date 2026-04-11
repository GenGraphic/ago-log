import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Props {
  label: string;
  value?: string | null;
  sensitive?: boolean;
}

export function InfoRow({ label, value, sensitive = false }: Props) {
  const icon = useThemeColor({}, "icon");
  const text = useThemeColor({}, "text");
  const borderColor = useThemeColor({ light: "#E0E0E0", dark: "#1E2A3A" }, "background");
  const [revealed, setRevealed] = useState(false);

  if (!value) return null;

  return (
    <View style={[styles.row, { borderBottomColor: borderColor }]}>
      <ThemedText style={[styles.label, { color: `${icon}80` }]}>
        {label}
      </ThemedText>
      <View style={styles.valueRow}>
        <ThemedText style={[styles.value, { color: text }]} numberOfLines={1} ellipsizeMode="tail">
          {sensitive && !revealed ? "X X X X X X X X" : value}
        </ThemedText>
        {sensitive && (
          <TouchableOpacity
            onPress={() => setRevealed((r) => !r)}
            style={{ marginLeft: 8 }}
          >
            <Feather
              name={revealed ? "eye-off" : "eye"}
              size={14}
              color={`${icon}80`}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 10, fontWeight: "600", letterSpacing: 1.5, flexShrink: 0 },
  valueRow: { flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "flex-end", paddingLeft: 12 },
  value: { fontSize: 13, fontWeight: "500", flexShrink: 1 },
});
