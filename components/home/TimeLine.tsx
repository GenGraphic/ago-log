import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { query } from "@/appwrite";
import { ThemedText } from "@/components/ThemedText";
import { StatusColors } from "@/constants/Colors";
import useEntries from "@/hooks/useEntries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { EntryStatus, EntryType } from "@/models/enums";
import { Entry } from "@/models/types";

const ICON_MAP: Record<
  EntryType,
  React.ComponentProps<typeof Feather>["name"]
> = {
  [EntryType.PASSPORT]: "book-open",
  [EntryType.DRIVING_LICENSE]: "credit-card",
  [EntryType.ID_CARD]: "credit-card",
  [EntryType.VISA]: "globe",
  [EntryType.CAR_INSURANCE]: "shield",
  [EntryType.HEALTH_INSURANCE]: "activity",
  [EntryType.HOME_INSURANCE]: "home",
  [EntryType.TRAVEL_INSURANCE]: "map",
  [EntryType.CAR_INSPECTION]: "truck",
  [EntryType.CAR_MAINTENANCE]: "tool",
  [EntryType.VEHICLE_REGISTRATION]: "file-text",
  [EntryType.VACCINATION]: "thermometer",
  [EntryType.PRESCRIPTION]: "clipboard",
  [EntryType.MEDICAL_CHECKUP]: "heart",
  [EntryType.SUBSCRIPTION]: "refresh-cw",
  [EntryType.CONTRACT]: "file",
  [EntryType.WARRANTY]: "award",
  [EntryType.PROPERTY_LEASE]: "key",
  [EntryType.BIRTHDAY]: "gift",
  [EntryType.ANNIVERSARY]: "star",
  [EntryType.CREDENTIAL]: "lock",
  [EntryType.REMINDER]: "bell",
};

const MONTH_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

function getDaysLeft(iso: string): number {
  return Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function entryTypeLabel(type: EntryType): string {
  return type.replace(/_/g, " ").toUpperCase();
}

export default function TimeLine() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const { queryEntries } = useEntries();

  const tint = useThemeColor({}, "tint");
  const icon = useThemeColor({}, "icon");
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#1C2333" },
    "background",
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await queryEntries([
        query.equal("status", EntryStatus.ACTIVE),
        query.isNotNull("expiryDate"),
        query.greaterThan("expiryDate", new Date().toISOString()),
        query.orderAsc("expiryDate"),
        query.limit(3),
      ]);
      if (result.success) setEntries(result.data);
    } finally {
      setLoading(false);
    }
  }, [queryEntries]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.heading}>Timeline View</ThemedText>

      {loading ? (
        <ActivityIndicator color={tint} style={{ marginTop: 12 }} />
      ) : entries.length === 0 ? (
        <ThemedText style={[styles.empty, { color: icon }]}>
          No upcoming entries.
        </ThemedText>
      ) : (
        entries.map((entry) => {
          const daysLeft = entry.expiryDate
            ? getDaysLeft(entry.expiryDate)
            : null;
          const entryIcon = ICON_MAP[entry.entryType] ?? "circle";

          const daysColor =
            daysLeft === null
              ? tint
              : daysLeft <= 7
                ? StatusColors.expired
                : daysLeft <= 30
                  ? "#FFB547"
                  : tint;

          return (
            <TouchableOpacity
              key={entry.id}
              style={[styles.row, { backgroundColor: cardBg }]}
              activeOpacity={0.75}
              onPress={() =>
                router.push(`/(main)/entry-details/${entry.id}` as any)
              }
            >
              {/* Icon box */}
              <View style={[styles.iconBox, { backgroundColor: `${tint}18` }]}>
                <Feather name={entryIcon} size={20} color={tint} />
              </View>

              {/* Info */}
              <View style={styles.info}>
                <ThemedText style={styles.entryTitle}>{entry.title}</ThemedText>
                <ThemedText style={[styles.meta, { color: icon }]}>
                  {entryTypeLabel(entry.entryType)}
                  {entry.expiryDate ? ` • ${formatDate(entry.expiryDate)}` : ""}
                </ThemedText>
              </View>

              {/* Days left */}
              {daysLeft !== null && (
                <View style={styles.daysBlock}>
                  <ThemedText style={[styles.daysCount, { color: daysColor }]}>
                    {daysLeft}d
                  </ThemedText>
                  <ThemedText style={[styles.daysLabel, { color: icon }]}>
                    LEFT
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  daysBlock: {
    alignItems: "flex-end",
    gap: 1,
  },
  daysCount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  daysLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
  },
  empty: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 8,
  },
});
