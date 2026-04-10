import { ThemedText } from "@/components/ThemedText";
import { formatTime } from "@/components/notifications/notificationUtils";
import { useThemeColor } from "@/hooks/useThemeColor";
import { NotifType } from "@/models/enums";
import { Notification } from "@/models/types";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const ICON_CONFIG: Record<
  NotifType,
  {
    name: React.ComponentProps<typeof Feather>["name"];
    color: string;
    bg: string;
  }
> = {
  expired: {
    name: "alert-circle",
    color: "#FF6060",
    bg: "rgba(255,96,96,0.12)",
  },
  warning: {
    name: "alert-triangle",
    color: "#FFA500",
    bg: "rgba(255,165,0,0.12)",
  },
  info: { name: "info", color: "#9BA1A6", bg: "rgba(155,161,166,0.12)" },
  sync: { name: "refresh-cw", color: "#00F0FF", bg: "rgba(0,240,255,0.10)" },
};

type Props = {
  item: Notification;
  onPress: (id: string) => void;
};

export default function NotificationRow({ item, onPress }: Props) {
  const cfg = ICON_CONFIG[item.type];
  const rowBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const unreadBg = useThemeColor(
    { light: "#F1F5F9", dark: "#181818" },
    "background",
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(item.id)}
      style={[styles.row, { backgroundColor: item.read ? rowBg : unreadBg }]}
    >
      <View style={[styles.accent, { backgroundColor: cfg.color }]} />
      <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
        <Feather name={cfg.name} size={18} color={cfg.color} />
      </View>
      <View style={styles.body}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.desc} numberOfLines={2}>
          {item.body}
        </ThemedText>
      </View>
      <View style={styles.meta}>
        <ThemedText style={styles.time}>{formatTime(item.sentAt)}</ThemedText>
        {!item.read && <View style={styles.dot} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  accent: { width: 3, alignSelf: "stretch", flexShrink: 0 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 13,
  },
  body: { flex: 1, gap: 3, paddingVertical: 14 },
  title: { fontSize: 14, fontWeight: "600", color: "#ECEDEE" },
  desc: { fontSize: 12, color: "#555", lineHeight: 17 },
  meta: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
    paddingVertical: 14,
    paddingRight: 14,
  },
  time: { fontSize: 11, color: "#444" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#00F0FF" },
});
