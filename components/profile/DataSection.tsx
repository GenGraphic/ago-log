import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";

import useAuth from "@/hooks/useAuth";
import useEntries from "@/hooks/useEntries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RowDivider, SectionLabel, SettingRow, sharedStyles } from "./shared";

const EXPORT_VERSION = 1;

export function DataSection() {
  const { t } = useTranslation();
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
        Alert.alert(t("common.error"), result.message ?? t("profile.failedToLoad"));
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
        dialogTitle: t("profile.exportTitle"),
        UTI: "public.json",
      });
    } catch (error: any) {
      console.log("Error exporting data: ", error);
      Alert.alert(t("common.error"), t("profile.exportError"));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("profile.deleteTitle"),
      t("profile.deleteMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            const result = await deleteAccount();
            setDeleting(false);
            if (!result.success) {
              Alert.alert(
                t("common.error"),
                result.message ?? t("profile.failedToDelete"),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <SectionLabel title={t("profile.dataManagement")} />
      <View style={[sharedStyles.card, { backgroundColor: cardBg }]}>
        <SettingRow
          label={exporting ? t("profile.exporting") : t("profile.exportLedger")}
          onPress={handleExport}
        />
        <RowDivider />
        <SettingRow
          label={deleting ? t("profile.deleting") : t("profile.deleteAccount")}
          onPress={handleDeleteAccount}
          danger
          rightIcon="trash-2"
        />
      </View>
    </>
  );
}
