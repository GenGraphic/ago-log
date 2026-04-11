import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { query } from "@/appwrite";
import { FREE_LOG_LIMIT } from "@/constants/plans";
import useEntries from "@/hooks/useEntries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { EntryStatus, UserPlan } from "@/models/enums";
import { useAppSelector } from "@/store/hooks";
import { ThemedText } from "../ThemedText";

export function IntelligenceLoad() {
  const plan = useAppSelector((s) => s.user.plan);
  const isPro = plan === UserPlan.PRO;
  const { queryEntries } = useEntries();

  const [active, setActive] = useState(0);
  const [expired, setExpired] = useState(0);
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const dividerBg = useThemeColor(
    { light: "#E5E7EB", dark: "#1E1E1E" },
    "icon",
  );

  useEffect(() => {
    async function load() {
      const [activeRes, expiredRes] = await Promise.all([
        queryEntries([query.equal("status", EntryStatus.ACTIVE)]),
        queryEntries([query.equal("status", EntryStatus.EXPIRED)]),
      ]);
      if (activeRes.success && activeRes.data) setActive(activeRes.data.length);
      if (expiredRes.success && expiredRes.data)
        setExpired(expiredRes.data.length);
    }
    load();
  }, [queryEntries]);

  const total = active + expired;
  const limit = isPro ? "∞" : String(FREE_LOG_LIMIT);

  return (
    <View style={[styles.statsRow, { backgroundColor: cardBg }]}>
      <View style={styles.statCard}>
        <ThemedText style={styles.statValue}>{String(active).padStart(2, "0")}</ThemedText>
        <Text style={styles.statKey}>ACTIVE</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: dividerBg }]} />
      <View style={styles.statCard}>
        <ThemedText style={[styles.statValue, { color: "#FF6060" }]}>
          {String(expired).padStart(2, "0")}
        </ThemedText>
        <Text style={styles.statKey}>EXPIRED</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: dividerBg }]} />
      <View style={styles.statCard}>
        <ThemedText style={styles.statValue}>
          {String(total).padStart(2, "0")}
          <Text style={styles.limitSuffix}> / {limit}</Text>
        </ThemedText>
        <Text style={styles.statKey}>TOTAL</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    marginVertical: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  limitSuffix: {
    fontSize: 14,
    fontWeight: "600",
  },
  statKey: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
