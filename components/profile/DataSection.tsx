import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import { Alert, View } from "react-native";

import useAuth from "@/hooks/useAuth";
import useEntries from "@/hooks/useEntries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RowDivider, SectionLabel, SettingRow, sharedStyles } from "./shared";

const EXPORT_VERSION = 1;

export function DataSection() {
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const { deleteAccount } = useAuth();
  const { listEntries } = useEntries();
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await listEntries();
      if (!result.success) {
        Alert.alert("Error", result.message ?? "Failed to load entries.");
        return;
      }

      const payload = {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        entries: result.data,
      };

      const json = JSON.stringify(payload, null, 2);
      const file = new File(Paths.cache, "agolog-export.json");
      if (file.exists) file.delete();
      file.create();
      file.write(json);

      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Export AgoLog Data",
        UTI: "public.json",
      });
    } catch (error: any) {
      console.log("Error exporting data: ", error);
      Alert.alert("Error", "Something went wrong while exporting.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? You will permanently lose access to this account. Your data will not be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            const result = await deleteAccount();
            setDeleting(false);
            if (!result.success) {
              Alert.alert(
                "Error",
                result.message ?? "Failed to delete account.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <SectionLabel title="DATA MANAGEMENT" />
      <View style={[sharedStyles.card, { backgroundColor: cardBg }]}>
        <SettingRow
          label={exporting ? "Exporting..." : "Export ledger account"}
          onPress={handleExport}
        />
        <RowDivider />
        <SettingRow
          label={deleting ? "Deleting..." : "Delete account"}
          onPress={handleDeleteAccount}
          danger
          rightIcon="trash-2"
        />
      </View>
    </>
  );
}
