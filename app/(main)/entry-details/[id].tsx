import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { ENTRIES_IMAGES_BUCKET_ID } from "@/appwrite";
import { ThemedText } from "@/components/ThemedText";
import { StatusColors } from "@/constants/Colors";
import useEntries from "@/hooks/useEntries";
import useStorage from "@/hooks/useStorage";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ENTRY_CONFIG } from "@/models/entryConfig";
import { EntryStatus } from "@/models/enums";
import { Entry } from "@/models/types";

// --- Helpers ---

function formatDate(iso?: string): string {
  if (!iso) return "---";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return iso;
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function statusColor(entry: Entry): string {
  switch (entry.status) {
    case EntryStatus.EXPIRED:
      return StatusColors.expired;
    case EntryStatus.ARCHIVED:
      return StatusColors.archived;
    default:
      return StatusColors.active;
  }
}

// --- InfoRow ---

interface InfoRowProps {
  label: string;
  value?: string | null;
  sensitive?: boolean;
}

function InfoRow({ label, value, sensitive = false }: InfoRowProps) {
  const icon = useThemeColor({}, "icon");
  const text = useThemeColor({}, "text");
  const [revealed, setRevealed] = useState(false);

  if (!value) return null;

  return (
    <View style={detailStyles.infoRow}>
      <ThemedText style={[detailStyles.infoLabel, { color: `${icon}80` }]}>
        {label}
      </ThemedText>
      <View style={detailStyles.infoValueRow}>
        <ThemedText style={[detailStyles.infoValue, { color: text }]}>
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

// --- Screen ---

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tint = useThemeColor({}, "tint");
  const icon = useThemeColor({}, "icon");
  const text = useThemeColor({}, "text");
  const screenBg = useThemeColor(
    { light: "#F6F6F6", dark: "#0B1120" },
    "background",
  );

  const { getEntry, deleteEntry } = useEntries();
  const { getImagePreview } = useStorage();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const res = await getEntry(id);
    if (res.success) {
      setEntry(res.data);
      if (res.data.imageId) {
        const imgRes = await getImagePreview(
          ENTRIES_IMAGES_BUCKET_ID,
          res.data.imageId,
        );
        if (imgRes.success) setImageUri(imgRes.data);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Could not load entry",
        text2: res.message,
      });
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleDelete = () => {
    Alert.alert("Delete Entry", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const res = await deleteEntry(id!);
          if (res.success) {
            Toast.show({ type: "success", text1: "Entry deleted" });
            router.replace("/(main)/(tabs)");
          } else {
            Toast.show({
              type: "error",
              text1: "Delete failed",
              text2: res.message,
            });
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          detailStyles.fill,
          {
            backgroundColor: screenBg,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <ActivityIndicator color={tint} size="large" />
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView
        style={[
          detailStyles.fill,
          {
            backgroundColor: screenBg,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <ThemedText style={{ color: icon }}>Entry not found.</ThemedText>
      </SafeAreaView>
    );
  }

  const config = ENTRY_CONFIG[entry.entryType];
  const color = statusColor(entry);
  const days = daysUntil(entry.expiryDate);

  return (
    <SafeAreaView style={[detailStyles.fill, { backgroundColor: screenBg }]}>
      <View style={detailStyles.topBar}>
        <TouchableOpacity
          style={detailStyles.backBtn}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={icon} />
        </TouchableOpacity>
        <View style={detailStyles.logoRow}>
          <ThemedText style={[detailStyles.logoText, { color: text }]}>
            AGO_LOG
          </ThemedText>
          <View style={[detailStyles.logoDot, { backgroundColor: tint }]} />
        </View>
        <TouchableOpacity
          style={detailStyles.backBtn}
          onPress={() => router.push(`/(main)/edit-entry/${id}`)}
        >
          <Feather name="edit-2" size={18} color={tint} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={detailStyles.scroll}
        contentContainerStyle={detailStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={detailStyles.image}
            contentFit="cover"
          />
        )}
        <ThemedText style={[detailStyles.typeLabel, { color: `${icon}80` }]}>
          {entry.entryType.replace(/_/g, " ").toUpperCase()}
        </ThemedText>
        <ThemedText style={[detailStyles.title, { color: text }]}>
          {entry.title}
        </ThemedText>
        <View style={[detailStyles.statusPill, { borderColor: color }]}>
          <View style={[detailStyles.statusDot, { backgroundColor: color }]} />
          <ThemedText style={[detailStyles.statusText, { color }]}>
            {entry.status.toUpperCase()}
          </ThemedText>
        </View>
        {days !== null && (
          <View
            style={[detailStyles.countdownCard, { borderLeftColor: color }]}
          >
            <ThemedText style={[detailStyles.countdownNumber, { color }]}>
              {days < 0 ? Math.abs(days) : days}
            </ThemedText>
            <ThemedText
              style={[detailStyles.countdownLabel, { color: `${icon}99` }]}
            >
              {days < 0 ? "days overdue" : "days remaining"}
            </ThemedText>
            <ThemedText style={[detailStyles.countdownDate, { color: icon }]}>
              {config.expiryLabel ?? "Expiry"}: {formatDate(entry.expiryDate)}
            </ThemedText>
          </View>
        )}
        <View style={[detailStyles.section, { borderColor: `${tint}18` }]}>
          <ThemedText
            style={[detailStyles.sectionTitle, { color: `${icon}80` }]}
          >
            DETAILS
          </ThemedText>
          <InfoRow label="ISSUER" value={entry.issuer} />
          <InfoRow label="IDENTIFIER" value={entry.identifier} />
          <InfoRow label="USERNAME" value={entry.username} />
          <InfoRow label="SECRET" value={entry.secret} sensitive />
          <InfoRow label="URL" value={entry.url} />
          <InfoRow
            label="LAST SERVICE"
            value={
              entry.lastServiceDate
                ? formatDate(entry.lastServiceDate)
                : undefined
            }
          />
          <InfoRow
            label="LAST MILEAGE"
            value={
              entry.lastMileage != null
                ? `${entry.lastMileage.toLocaleString()} km`
                : undefined
            }
          />
          <InfoRow
            label="SERVICE INTERVAL"
            value={
              entry.intervalDays != null
                ? `${entry.intervalDays} days`
                : undefined
            }
          />
          <InfoRow
            label="MILEAGE INTERVAL"
            value={
              entry.mileageInterval != null
                ? `${entry.mileageInterval.toLocaleString()} km`
                : undefined
            }
          />
          <InfoRow label="ADDED" value={formatDate(entry.createdAt)} />
          <InfoRow label="LAST UPDATED" value={formatDate(entry.updatedAt)} />
        </View>
        {entry.notes && (
          <View style={[detailStyles.section, { borderColor: `${tint}18` }]}>
            <ThemedText
              style={[detailStyles.sectionTitle, { color: `${icon}80` }]}
            >
              NOTES
            </ThemedText>
            <ThemedText style={[detailStyles.notes, { color: `${icon}CC` }]}>
              {entry.notes}
            </ThemedText>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={detailStyles.footer}>
        <TouchableOpacity
          style={[detailStyles.editBtn, { borderColor: tint }]}
          onPress={() => router.push(`/(main)/edit-entry/${id}`)}
        >
          <Feather name="edit-2" size={16} color={tint} />
          <ThemedText style={[detailStyles.editBtnText, { color: tint }]}>
            EDIT
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={detailStyles.deleteBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={16} color="#fff" />
          <ThemedText style={detailStyles.deleteBtnText}>DELETE</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---

const detailStyles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  logoText: { fontSize: 13, fontWeight: "700", letterSpacing: 2 },
  logoDot: { width: 6, height: 6, borderRadius: 3 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  image: { width: "100%", height: 180, borderRadius: 12, marginBottom: 20 },
  typeLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5 },
  countdownCard: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 2,
  },
  countdownNumber: { fontSize: 40, fontWeight: "800", lineHeight: 44 },
  countdownLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  countdownDate: { fontSize: 12, marginTop: 4 },
  section: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1E2A3A",
  },
  infoLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 1.5 },
  infoValueRow: { flexDirection: "row", alignItems: "center" },
  infoValue: { fontSize: 13, fontWeight: "500" },
  notes: { fontSize: 13, lineHeight: 20 },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  editBtnText: { fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#fff",
  },
});
