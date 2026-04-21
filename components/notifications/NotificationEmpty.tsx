import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export default function NotificationEmpty() {
  const { t } = useTranslation();
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const iconColor = useThemeColor({}, "icon");

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: cardBg }]}>
        <Feather name="bell-off" size={28} color={iconColor} />
      </View>
      <ThemedText style={styles.title}>{t('notifications.allCaughtUp')}</ThemedText>
      <ThemedText style={styles.subtitle}>
        {t('notifications.noneToShow')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingTop: 80, gap: 12 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#666" },
  subtitle: { fontSize: 13, color: "#444" },
});
