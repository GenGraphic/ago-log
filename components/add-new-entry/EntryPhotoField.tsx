import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { pickImageFromLibrary, takePhotoWithCamera } from "@/helpers/imageHelper";
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
  /** Current image: a download URL or a freshly picked local file. */
  uri?: string | null;
  label: string;
  onChange: (localUri: string) => void;
};

/**
 * Photo attached to an entry (document, receipt) that can be replaced from
 * the camera or the library, without going through the AI scan.
 */
export default function EntryPhotoField({ uri, label, onChange }: Props) {
  const { t } = useTranslation();
  const tint = useThemeColor({}, "tint");
  const icon = useThemeColor({}, "icon");
  const cardBg = useThemeColor({ light: "#FFFFFF", dark: "#141C2A" }, "background");
  const cardBorder = useThemeColor({ light: "#E3EAF2", dark: "#273246" }, "background");

  const pick = async (source: "camera" | "library") => {
    const picked = source === "camera" ? await takePhotoWithCamera() : await pickImageFromLibrary();
    if (picked) onChange(picked);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: icon }]}>{label}</ThemedText>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        {uri ? (
          <Image source={{ uri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.empty}>
            <Feather name="image" size={24} color={`${icon}80`} />
          </View>
        )}
        <View style={[styles.actions, { borderTopColor: cardBorder }]}>
          <TouchableOpacity style={styles.action} onPress={() => pick("camera")} activeOpacity={0.7}>
            <Feather name="camera" size={14} color={tint} />
            <ThemedText style={[styles.actionText, { color: tint }]}>{t("photo.camera")}</ThemedText>
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: cardBorder }]} />
          <TouchableOpacity style={styles.action} onPress={() => pick("library")} activeOpacity={0.7}>
            <Feather name="image" size={14} color={tint} />
            <ThemedText style={[styles.actionText, { color: tint }]}>{t("photo.library")}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  card: { borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  preview: { width: "100%", height: 180 },
  empty: { height: 90, alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", borderTopWidth: 1 },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  actionText: { fontSize: 12, fontWeight: "600" },
  separator: { width: 1 },
});
