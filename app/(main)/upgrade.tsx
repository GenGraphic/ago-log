import Header from "@/components/upgrade/Header";
import { useFreeLimitReached } from "@/hooks/useFreeLimitReached";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ComparisonTable } from "../../components/upgrade/ComparisonTable";
import { LimitBanner } from "../../components/upgrade/LimitBanner";
import { PriceCard } from "../../components/upgrade/PriceCard";
import { UpgradeFooter } from "../../components/upgrade/UpgradeFooter";
import {
    BillingCycle,
    PLAN_COMPARISON,
    PLAN_PRICE,
    PRO_FEATURES,
} from "../../constants/plans";
import { useRevenueCat } from "../../hooks/useRevenueCat";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UpgradeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const { presentPaywall, isLoading } = useRevenueCat();
  const limitStatus = useFreeLimitReached();
  const screenBg = useThemeColor(
    { light: "#F6F6F6", dark: "#0D0D0D" },
    "background",
  );

  const price = PLAN_PRICE[billing];

  async function handleUpgrade() {
    const purchased = await presentPaywall();
    if (purchased) router.back();
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: screenBg },
      ]}
    >
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {limitStatus !== "none" && (
          <LimitBanner variant={limitStatus} showUpgradeLink={false} />
        )}

        {/* ── Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Upgrade to Pro</Text>
          <Text style={styles.heroSub}>Never miss anything important</Text>
        </View>

        <PriceCard price={price} features={PRO_FEATURES} />

        {/* ── CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, isLoading && styles.ctaBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleUpgrade}
          disabled={isLoading}
        >
          <Text style={styles.ctaText}>
            {isLoading ? "LOADING…" : "UPGRADE TO PRO"}
          </Text>
        </TouchableOpacity>

        {/* ── Billing toggle */}
        <View style={styles.billingToggleRow}>
          <TouchableOpacity
            onPress={() =>
              setBilling(billing === "yearly" ? "monthly" : "yearly")
            }
          >
            <Text style={styles.billingToggleText}>
              SWITCH TO {billing === "yearly" ? "MONTHLY" : "ANNUAL"} BILLING
            </Text>
          </TouchableOpacity>
        </View>

        <ComparisonTable rows={PLAN_COMPARISON} />

        <UpgradeFooter />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ECEDEE",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: "#555",
  },
  ctaBtn: {
    marginHorizontal: 20,
    marginBottom: 14,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#00F0FF",
    alignItems: "center",
  },
  ctaBtnDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0D0D0D",
    letterSpacing: 1.5,
  },
  billingToggleRow: {
    alignItems: "center",
    marginBottom: 32,
  },
  billingToggleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#444",
    letterSpacing: 0.8,
    textDecorationLine: "underline",
  },
});
