import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { StyleSheet, View } from "react-native";

interface PriceInfo {
  amount: string;
  period: string;
  note: string;
}

interface Props {
  price: PriceInfo;
  features: string[];
}

export function PriceCard({ price, features }: Props) {
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#111111" },
    "background",
  );
  const badgeBg = useThemeColor(
    { light: "#F3F4F6", dark: "#1A1A1A" },
    "background",
  );
  const text = useThemeColor({}, "text");
  const icon = useThemeColor({}, "icon");
  const badgeBorder = useThemeColor({ light: "#D1D5DB", dark: "#222222" }, "background");

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.header}>
        <View style={[styles.tierBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
          <ThemedText style={[styles.tierText, { color: icon }]}>ELITE TIER</ThemedText>
        </View>
        <View style={styles.boltBadge}>
          <Feather name="zap" size={14} color="#0D0D0D" />
        </View>
      </View>

      <View style={styles.priceRow}>
        <ThemedText style={[styles.amount, { color: text }]}>{price.amount}</ThemedText>
        <ThemedText style={[styles.period, { color: icon }]}>{price.period}</ThemedText>
      </View>
      <ThemedText style={[styles.note, { color: icon }]}>{price.note}</ThemedText>

      <View style={styles.featureList}>
        {features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Feather name="check-circle" size={14} color="#00F0FF" />
            <ThemedText style={[styles.featureText, { color: icon }]}>{f}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,240,255,0.2)",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  boltBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#00F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginBottom: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: "800",
    lineHeight: 54,
  },
  period: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  note: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 20,
  },
  featureList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 13,
  },
});
