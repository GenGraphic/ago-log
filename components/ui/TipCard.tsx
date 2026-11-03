import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

const storageKey = (id: string) => `tip_dismissed_${id}`;

type Props = {
  /** Stable id; texts are read from `tips.<id>.title` / `tips.<id>.body`. */
  id: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  style?: StyleProp<ViewStyle>;
};

/**
 * One-time explanation shown the first time a screen is opened. Stays
 * hidden once dismissed (per device).
 */
export default function TipCard({ id, icon = "info", style }: Props) {
  const { t } = useTranslation();
  const tint = useThemeColor({}, "tint");
  const muted = useThemeColor({}, "icon");
  const text = useThemeColor({}, "text");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(storageKey(id))
      .then((v) => setVisible(v !== "1"))
      .catch(() => setVisible(false));
  }, [id]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    AsyncStorage.setItem(storageKey(id), "1").catch(() => {});
  };

  return (
    <View style={[styles.card, { backgroundColor: `${tint}10`, borderColor: `${tint}35` }, style]}>
      <Feather name={icon} size={18} color={tint} style={styles.icon} />
      <View style={styles.texts}>
        <ThemedText style={[styles.title, { color: text }]}>{t(`tips.${id}.title`)}</ThemedText>
        <ThemedText style={[styles.body, { color: `${muted}E0` }]}>{t(`tips.${id}.body`)}</ThemedText>
        <TouchableOpacity onPress={dismiss} hitSlop={8}>
          <ThemedText style={[styles.gotIt, { color: tint }]}>{t("tips.gotIt")}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  icon: { marginTop: 2 },
  texts: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: "700" },
  body: { fontSize: 13, lineHeight: 19 },
  gotIt: { fontSize: 12, fontWeight: "800", letterSpacing: 1, marginTop: 4 },
});
