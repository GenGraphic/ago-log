import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import EntryTypePicker from "@/components/add-new-entry/EntryTypePicker";
import FormDateInput from "@/components/add-new-entry/FormDateInput";
import FormTextInput from "@/components/add-new-entry/FormTextInput";
import NotifyChips from "@/components/add-new-entry/NotifyChips";
import MyMainButton from "@/components/MyMainButton";
import { ThemedText } from "@/components/ThemedText";
import useEntries from "@/hooks/useEntries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ENTRY_CONFIG, EntryFieldConfig } from "@/models/entryConfig";
import { EntryStatus, EntryType } from "@/models/enums";
import { Entry_DB } from "@/models/types";

type EntryFormData = {
  entryType?: EntryType;
  title: string;
  notes?: string;
  expiryDate?: string;
  notifyDays: number[];
  issuer?: string;
  identifier?: string;
  secret?: string;
  username?: string;
  url?: string;
  lastServiceDate?: string;
  intervalDays?: string;
  lastMileage?: string;
  mileageInterval?: string;
};

function hasTypeSpecificFields(config: EntryFieldConfig): boolean {
  return (
    config.showIssuer ||
    config.showIdentifier ||
    config.showSecret ||
    config.showUsername ||
    config.showUrl ||
    config.showLastServiceDate ||
    config.showIntervalDays ||
    config.showLastMileage ||
    config.showMileageInterval
  );
}

export default function EditDocumentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tint = useThemeColor({}, "tint");
  const icon = useThemeColor({}, "icon");
  const text = useThemeColor({}, "text");
  const screenBg = useThemeColor(
    { light: "#F6F6F6", dark: "#0B1120" },
    "background",
  );
  const { getEntry, updateEntry } = useEntries();
  const [submitting, setSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const { control, watch, handleSubmit, setValue, reset } =
    useForm<EntryFormData>({
      defaultValues: { notifyDays: [] },
    });

  const entryType = watch("entryType");
  const watchedTitle = watch("title");
  const config = entryType ? ENTRY_CONFIG[entryType] : null;
  const showTypeFields = config ? hasTypeSpecificFields(config) : false;

  const load = useCallback(async () => {
    if (!id) return;
    const res = await getEntry(id);
    if (res.success) {
      const e = res.data;
      reset({
        entryType: e.entryType,
        title: e.title,
        notes: e.notes ?? "",
        expiryDate: e.expiryDate ?? "",
        notifyDays: e.notifyDaysBefore ? [e.notifyDaysBefore] : [],
        issuer: e.issuer ?? "",
        identifier: e.identifier ?? "",
        secret: e.secret ?? "",
        username: e.username ?? "",
        url: e.url ?? "",
        lastServiceDate: e.lastServiceDate ?? "",
        intervalDays:
          e.intervalDays !== undefined ? String(e.intervalDays) : "",
        lastMileage: e.lastMileage !== undefined ? String(e.lastMileage) : "",
        mileageInterval:
          e.mileageInterval !== undefined ? String(e.mileageInterval) : "",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Could not load entry",
        text2: res.message,
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (data: EntryFormData) => {
    if (!data.entryType) {
      Toast.show({ type: "error", text1: "Entry type required" });
      return;
    }
    setSubmitting(true);
    try {
      const notifyDaysBefore =
        data.notifyDays.length > 0 ? Math.min(...data.notifyDays) : undefined;
      const isPast = data.expiryDate
        ? new Date(data.expiryDate).getTime() < Date.now()
        : false;

      const updated: Partial<Entry_DB> = {
        title: data.title,
        entryType: data.entryType,
        status: isPast ? EntryStatus.EXPIRED : EntryStatus.ACTIVE,
        notes: data.notes || undefined,
        expiryDate: data.expiryDate || undefined,
        notifyDaysBefore,
        issuer: data.issuer || undefined,
        identifier: data.identifier || undefined,
        secret: data.secret || undefined,
        username: data.username || undefined,
        url: data.url || undefined,
        lastServiceDate: data.lastServiceDate || undefined,
        intervalDays: data.intervalDays
          ? parseInt(data.intervalDays, 10)
          : undefined,
        lastMileage: data.lastMileage
          ? parseInt(data.lastMileage, 10)
          : undefined,
        mileageInterval: data.mileageInterval
          ? parseInt(data.mileageInterval, 10)
          : undefined,
      };

      const res = await updateEntry(updated, id!);
      if (!res.success) {
        Toast.show({
          type: "error",
          text1: "Update failed",
          text2: res.message,
        });
        return;
      }
      Toast.show({ type: "success", text1: "Entry updated" });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Unexpected error",
        text2: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          editStyles.fill,
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

  return (
    <SafeAreaView style={[editStyles.fill, { backgroundColor: screenBg }]}>
      {/* Top bar */}
      <View style={editStyles.topBar}>
        <TouchableOpacity
          style={editStyles.backBtn}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={icon} />
        </TouchableOpacity>
        <View style={editStyles.logoRow}>
          <ThemedText style={[editStyles.logoText, { color: text }]}>
            AGO_LOG
          </ThemedText>
          <View style={[editStyles.logoDot, { backgroundColor: tint }]} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Title area */}
      <View style={editStyles.titleArea}>
        <ThemedText style={[editStyles.sectionLabel, { color: `${icon}80` }]}>
          MODIFY RECORD
        </ThemedText>
        <ThemedText style={[editStyles.pageTitle, { color: text }]}>
          {watchedTitle?.trim() || "Edit Entry"}
        </ThemedText>
        {entryType && (
          <ThemedText
            style={[editStyles.entrySubtitle, { color: `${icon}70` }]}
          >
            {entryType.replace(/_/g, " ").toUpperCase()}
          </ThemedText>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          style={editStyles.scroll}
          contentContainerStyle={editStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <EntryTypePicker control={control} name="entryType" />

          <FormTextInput
            control={control}
            name="title"
            label="TITLE"
            placeholder="e.g. My Passport"
            rules={{ required: "Title is required" }}
          />

          {config?.showExpiryDate && (
            <FormDateInput
              control={control}
              name="expiryDate"
              label={config.expiryLabel.toUpperCase()}
            />
          )}

          {config?.showNotifyDaysBefore && (
            <NotifyChips control={control} name="notifyDays" />
          )}

          {showTypeFields && config && (
            <>
              <View style={editStyles.sectionDivider}>
                <View
                  style={[
                    editStyles.dividerLine,
                    { backgroundColor: `${tint}25` },
                  ]}
                />
                <ThemedText
                  style={[editStyles.dividerLabel, { color: `${tint}90` }]}
                >
                  {entryType?.replace(/_/g, " ").toUpperCase()} FIELDS
                </ThemedText>
                <View
                  style={[
                    editStyles.dividerLine,
                    { backgroundColor: `${tint}25` },
                  ]}
                />
              </View>
              {config.showIssuer && (
                <FormTextInput
                  control={control}
                  name="issuer"
                  label="ISSUER"
                  placeholder="Organisation or company"
                />
              )}
              {config.showIdentifier && (
                <FormTextInput
                  control={control}
                  name="identifier"
                  label="IDENTIFIER"
                  placeholder="Policy number, ID, reference"
                  sensitive
                />
              )}
              {config.showSecret && (
                <FormTextInput
                  control={control}
                  name="secret"
                  label="SECRET"
                  placeholder="Password or secret key"
                  sensitive
                  secureTextEntry
                />
              )}
              {config.showUsername && (
                <FormTextInput
                  control={control}
                  name="username"
                  label="USERNAME"
                  placeholder="Username or email"
                />
              )}
              {config.showUrl && (
                <FormTextInput
                  control={control}
                  name="url"
                  label="URL"
                  placeholder="https://..."
                  keyboardType="url"
                  autoCapitalize="none"
                />
              )}
              {config.showLastServiceDate && (
                <FormDateInput
                  control={control}
                  name="lastServiceDate"
                  label="LAST SERVICE DATE"
                />
              )}
              {config.showIntervalDays && (
                <FormTextInput
                  control={control}
                  name="intervalDays"
                  label="SERVICE INTERVAL (DAYS)"
                  placeholder="e.g. 365"
                  keyboardType="number-pad"
                />
              )}
              {config.showLastMileage && (
                <FormTextInput
                  control={control}
                  name="lastMileage"
                  label="LAST MILEAGE"
                  placeholder="e.g. 45000"
                  keyboardType="number-pad"
                />
              )}
              {config.showMileageInterval && (
                <FormTextInput
                  control={control}
                  name="mileageInterval"
                  label="MILEAGE INTERVAL"
                  placeholder="e.g. 10000"
                  keyboardType="number-pad"
                />
              )}
            </>
          )}

          <FormTextInput
            control={control}
            name="notes"
            label="NOTES"
            placeholder="Additional information..."
            multiline
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={editStyles.footer}>
        <MyMainButton
          title={submitting ? "SAVING..." : "SAVE CHANGES"}
          isDisabled={submitting}
          action={handleSubmit(onSubmit)}
        />
        <TouchableOpacity
          style={editStyles.cancelBtn}
          onPress={() => router.back()}
        >
          <ThemedText style={[editStyles.cancelText, { color: `${icon}80` }]}>
            CANCEL
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const editStyles = StyleSheet.create({
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
  titleArea: { paddingHorizontal: 20, paddingBottom: 12 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 2,
  },
  pageTitle: { fontSize: 26, fontWeight: "bold", letterSpacing: 0.5 },
  entrySubtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 8,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 2 },
  footer: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontSize: 11, fontWeight: "600", letterSpacing: 1.5 },
});
