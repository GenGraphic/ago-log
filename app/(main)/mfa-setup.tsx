import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedBackground from "@/components/AnimatedBackground";
import MyMainButton from "@/components/MyMainButton";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function MfaSetupScreen() {
  const router = useRouter();
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const border = useThemeColor({ light: "#E5E7EB", dark: "#252525" }, "icon");
  const secondary = useThemeColor(
    { light: "#60656B", dark: "#9BA1A6" },
    "icon",
  );
  const tint = useThemeColor({}, "tint");

  return (
    <AnimatedBackground style={styles.screen}>
      <SafeAreaView style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backBtn, { borderColor: border }]}
              activeOpacity={0.75}
            >
              <Feather name="chevron-left" size={18} color={tint} />
              <ThemedText style={styles.backLabel}>Back</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.titleWrap}>
            <ThemedText type="title" style={styles.title}>
              Google Authenticator
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: secondary }]}>
              Set up 2-step verification to add an extra layer of account
              security.
            </ThemedText>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: border },
            ]}
          >
            <ThemedText style={styles.cardTitle}>
              Step 1: Add Authenticator
            </ThemedText>
            <View style={[styles.qrPlaceholder, { borderColor: border }]}>
              <View style={styles.placeholderContent}>
                <Feather name="grid" size={34} color={secondary} />
                <ThemedText style={[styles.qrText, { color: secondary }]}>
                  Tap "Generate Authenticator" to create your QR code
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Coming Soon overlay */}
        <View style={styles.overlay}>
          <View
            style={[
              styles.overlayCard,
              { backgroundColor: cardBg, borderColor: border },
            ]}
          >
            <Feather name="lock" size={40} color={tint} />
            <ThemedText type="subtitle" style={styles.overlayTitle}>
              Coming Soon
            </ThemedText>
            <ThemedText style={[styles.overlayText, { color: secondary }]}>
              This feature will be available soon.
            </ThemedText>
            <View style={{ width: 200, marginTop: 12 }}>
              <MyMainButton 
                action={() => router.back()}
                title="Back"
                isDisabled={false}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  titleWrap: {
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  qrPlaceholder: {
    borderWidth: 1,
    borderRadius: 12,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  qrText: {
    fontSize: 13,
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  overlayCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },
  overlayTitle: {
    fontSize: 24,
    textAlign: "center",
  },
  overlayText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
