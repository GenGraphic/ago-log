import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import AnimatedBackground from "@/components/AnimatedBackground";
import MyMainButton from "@/components/MyMainButton";
import { ThemedText } from "@/components/ThemedText";
import useAssets from "@/hooks/useAssets";
import useUser from "@/hooks/useUser";
import { useThemeColor } from "@/hooks/useThemeColor";
import { GOAL_ASSET_TYPE, SETUP_GOALS, SetupGoal } from "@/models/suggestions";
import { useAppSelector } from "@/store/hooks";

const GOAL_ICONS: Record<SetupGoal, React.ComponentProps<typeof Feather>["name"]> = {
  vehicle: "truck",
  home: "home",
  documents: "credit-card",
  subscriptions: "repeat",
  warranties: "file-text",
};

// Shown to people who skip, so the home checklist still has a first step.
const SKIP_GOALS: SetupGoal[] = ["documents"];

/**
 * First-run setup: the user picks what they want to keep track of. Things
 * they own (car, home) become assets, and the home checklist then suggests
 * what to add for each one. This is where "asset" and "entry" are explained.
 */
export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const tint = useThemeColor({}, "tint");
  const icon = useThemeColor({}, "icon");
  const text = useThemeColor({}, "text");
  const cardBg = useThemeColor({ light: "#FFFFFF", dark: "#141C2A" }, "background");

  const userId = useAppSelector((s) => s.user.id);
  const { listAssets, createAsset } = useAssets();
  const { updateUserData } = useUser();
  const [selected, setSelected] = useState<SetupGoal[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (goal: SetupGoal) =>
    setSelected((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));

  const finish = async (goals: SetupGoal[]) => {
    setSaving(true);
    try {
      // One asset per owned thing, unless the user already has one of that
      // type (setup can be run again from the guide).
      const existing = await listAssets();
      const ownedTypes = new Set(existing.success ? existing.data.map((a) => a.type) : []);
      for (const goal of goals) {
        const type = GOAL_ASSET_TYPE[goal];
        if (!type || ownedTypes.has(type)) continue;
        await createAsset({ userId, type, name: t(`welcome.assetName.${goal}`) });
      }

      const res = await updateUserData({
        setupGoals: goals,
        setupCompletedAt: new Date().toISOString(),
        checklistDismissed: false,
      });
      if (!res.success) throw new Error(res.message);
      router.replace("/(main)/(tabs)");
    } catch (err: any) {
      Toast.show({ type: "error", text1: t("common.error"), text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatedBackground style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => finish(SKIP_GOALS)} disabled={saving} hitSlop={10}>
            <ThemedText style={[styles.skip, { color: `${icon}B0` }]}>{t("onboarding.skip")}</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText style={[styles.title, { color: text }]}>{t("welcome.title")}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: `${icon}D0` }]}>{t("welcome.subtitle")}</ThemedText>

          <View style={styles.options}>
            {SETUP_GOALS.map((goal) => {
              const active = selected.includes(goal);
              return (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.option,
                    { backgroundColor: cardBg, borderColor: active ? tint : `${icon}25` },
                    active && { backgroundColor: `${tint}12` },
                  ]}
                  onPress={() => toggle(goal)}
                  activeOpacity={0.8}>
                  <View style={[styles.optionIcon, { backgroundColor: `${tint}15` }]}>
                    <Feather name={GOAL_ICONS[goal]} size={20} color={tint} />
                  </View>
                  <View style={styles.optionTexts}>
                    <ThemedText style={[styles.optionTitle, { color: text }]}>
                      {t(`welcome.goals.${goal}.title`)}
                    </ThemedText>
                    <ThemedText style={[styles.optionExamples, { color: `${icon}B0` }]}>
                      {t(`welcome.goals.${goal}.examples`)}
                    </ThemedText>
                  </View>
                  <Feather
                    name={active ? "check-circle" : "circle"}
                    size={20}
                    color={active ? tint : `${icon}60`}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Assets vs entries, explained once, where it matters */}
          <View style={[styles.explainer, { borderColor: `${icon}25` }]}>
            <ThemedText style={[styles.explainerTitle, { color: `${icon}B0` }]}>
              {t("welcome.howTitle")}
            </ThemedText>
            <View style={styles.explainerRow}>
              <Feather name="box" size={16} color={tint} />
              <ThemedText style={[styles.explainerText, { color: text }]}>{t("welcome.howAssets")}</ThemedText>
            </View>
            <View style={styles.explainerRow}>
              <Feather name="file-text" size={16} color={tint} />
              <ThemedText style={[styles.explainerText, { color: text }]}>{t("welcome.howEntries")}</ThemedText>
            </View>
            <View style={styles.explainerRow}>
              <Feather name="bell" size={16} color={tint} />
              <ThemedText style={[styles.explainerText, { color: text }]}>{t("welcome.howReminders")}</ThemedText>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <MyMainButton
            title={saving ? t("welcome.saving") : t("welcome.continue")}
            isDisabled={saving || selected.length === 0}
            action={() => finish(selected)}
          />
        </View>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20, paddingVertical: 12 },
  skip: { fontSize: 13, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: "bold", lineHeight: 34 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  optionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  optionTexts: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 15, fontWeight: "600" },
  optionExamples: { fontSize: 12, lineHeight: 16 },
  explainer: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10, marginTop: 8 },
  explainerTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  explainerRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  explainerText: { flex: 1, fontSize: 13, lineHeight: 19 },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
});
