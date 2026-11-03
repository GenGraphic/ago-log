import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedBackground from "@/components/AnimatedBackground";
import BackHeader from "@/components/BackHeader";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

const SECTIONS: { key: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { key: "entries", icon: "file-text" },
  { key: "assets", icon: "box" },
  { key: "scan", icon: "camera" },
  { key: "reminders", icon: "bell" },
  { key: "insights", icon: "zap" },
  { key: "warranties", icon: "shopping-bag" },
];

/** "How it works" (Profile → Support): the main features, plus re-running the setup. */
export default function GuideScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const tint = useThemeColor({}, "tint");
  const icon = useThemeColor({}, "icon");
  const text = useThemeColor({}, "text");
  const cardBg = useThemeColor({ light: "#FFFFFF", dark: "#141C2A" }, "background");

  return (
    <AnimatedBackground style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <BackHeader />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText style={[styles.title, { color: text }]}>{t("guide.title")}</ThemedText>

          {SECTIONS.map(({ key, icon: name }) => (
            <View key={key} style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={[styles.iconBox, { backgroundColor: `${tint}15` }]}>
                <Feather name={name} size={18} color={tint} />
              </View>
              <View style={styles.texts}>
                <ThemedText style={[styles.cardTitle, { color: text }]}>
                  {t(`guide.sections.${key}.title`)}
                </ThemedText>
                <ThemedText style={[styles.cardBody, { color: `${icon}D0` }]}>
                  {t(`guide.sections.${key}.body`)}
                </ThemedText>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.redo, { borderColor: tint }]}
            onPress={() => router.push("/(main)/welcome")}
            activeOpacity={0.8}>
            <Feather name="refresh-cw" size={14} color={tint} />
            <ThemedText style={[styles.redoText, { color: tint }]}>{t("guide.redoSetup")}</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 4 },
  card: { flexDirection: "row", gap: 12, borderRadius: 14, padding: 14 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  texts: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardBody: { fontSize: 13, lineHeight: 19 },
  redo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  redoText: { fontSize: 13, fontWeight: "700", letterSpacing: 1 },
});
