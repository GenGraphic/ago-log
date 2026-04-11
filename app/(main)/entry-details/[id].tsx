import Feather from "@expo/vector-icons/Feather";
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
import { CountdownCard } from "@/components/entry-details/CountdownCard";
import { DetailsSection } from "@/components/entry-details/DetailsSection";
import { EntryDetailsFooter } from "@/components/entry-details/EntryDetailsFooter";
import { EntryImageViewer } from "@/components/entry-details/EntryImageViewer";
import { InfoRow } from "@/components/entry-details/InfoRow";
import { daysUntil, formatDate, statusColor } from "@/components/entry-details/helpers";
import useEntries from "@/hooks/useEntries";
import useStorage from "@/hooks/useStorage";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ENTRY_CONFIG } from "@/models/entryConfig";
import { Entry } from "@/models/types";

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
        {imageUri && <EntryImageViewer uri={imageUri} />}
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
          <CountdownCard
            days={days}
            color={color}
            expiryLabel={config.expiryLabel ?? "Expiry"}
            expiryDateFormatted={formatDate(entry.expiryDate)}
          />
        )}
        <DetailsSection title="DETAILS">
          <InfoRow label="ISSUER" value={entry.issuer} />
          <InfoRow label="IDENTIFIER" value={entry.identifier} />
          <InfoRow label="USERNAME" value={entry.username} />
          <InfoRow label="SECRET" value={entry.secret} sensitive />
          <InfoRow label="URL" value={entry.url} />
          <InfoRow label="LAST SERVICE" value={entry.lastServiceDate ? formatDate(entry.lastServiceDate) : undefined} />
          <InfoRow label="LAST MILEAGE" value={entry.lastMileage != null ? `${entry.lastMileage.toLocaleString()} km` : undefined} />
          <InfoRow label="SERVICE INTERVAL" value={entry.intervalDays != null ? `${entry.intervalDays} days` : undefined} />
          <InfoRow label="MILEAGE INTERVAL" value={entry.mileageInterval != null ? `${entry.mileageInterval.toLocaleString()} km` : undefined} />
          <InfoRow label="ADDED" value={formatDate(entry.createdAt)} />
          <InfoRow label="LAST UPDATED" value={formatDate(entry.updatedAt)} />
        </DetailsSection>
        {entry.notes && (
          <DetailsSection title="NOTES">
            <ThemedText style={[detailStyles.notes, { color: `${icon}CC` }]}>
              {entry.notes}
            </ThemedText>
          </DetailsSection>
        )}
      <View style={{ height: 24 }} />
      </ScrollView>

      <EntryDetailsFooter
        onEdit={() => router.push(`/(main)/edit-entry/${id}`)}
        onDelete={handleDelete}
      />
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
  notes: { fontSize: 13, lineHeight: 20 },
});
