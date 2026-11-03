import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Modal,
    Pressable,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";

import Toast from "react-native-toast-message";

import { COLLECTIONS, db } from "@/firebase";
import { useNotifications } from "@/hooks/useNotifications";
import { doc, updateDoc } from "firebase/firestore";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    ReminderDays,
    setDefaultReminder,
    setEmailNotifications,
    setPushNotifications,
} from "@/store/slices/preferencesSlice";
import { ThemedText } from "../ThemedText";
import { RowDivider, SectionLabel, sharedStyles } from "./shared";

export function NotificationsSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.user.id);
  const { defaultReminder, pushNotifications, emailNotifications } =
    useAppSelector((s) => s.preferences);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const { sendTestNotification } = useNotifications();
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const dropdownBg = useThemeColor(
    { light: "#FFFFFF", dark: "#1A1A1A" },
    "background",
  );

  const REMINDER_OPTIONS: { label: string; value: ReminderDays }[] = [
    { label: t("notifications.day1"), value: 1 },
    { label: t("notifications.day7"), value: 7 },
    { label: t("notifications.day30"), value: 30 },
  ];

  const selectedLabel =
    REMINDER_OPTIONS.find((o) => o.value === defaultReminder)?.label ??
    t("notifications.day7");

  async function handlePushToggle(v: boolean) {
    dispatch(setPushNotifications(v));
    if (userId)
      await updateDoc(doc(db, COLLECTIONS.users, userId), { pushEnabled: v });
  }

  async function handleEmailToggle(v: boolean) {
    dispatch(setEmailNotifications(v));
    if (userId)
      await updateDoc(doc(db, COLLECTIONS.users, userId), { emailEnabled: v });
  }

  async function handleTest() {
    setTesting(true);
    try {
      const res = await sendTestNotification();
      Toast.show({
        type: res.push === "sent" || res.email === "sent" ? "success" : "error",
        text1: t("notifications.testResultTitle"),
        text2: `${t("notifications.push")}: ${t(`notifications.testStatus.${res.push}`)} · ${t("notifications.email")}: ${t(`notifications.testStatus.${res.email}`)}`,
      });
    } catch (err: any) {
      Toast.show({ type: "error", text1: t("notifications.testResultTitle"), text2: err.message });
    } finally {
      setTesting(false);
    }
  }

  return (
    <>
      <SectionLabel title={t("notifications.sectionHeader")} />
      <View style={[sharedStyles.card, { backgroundColor: cardBg }]}>
        {/* Default Reminder Row */}
        <TouchableOpacity
          style={sharedStyles.row}
          activeOpacity={0.7}
          onPress={() => setDropdownOpen(true)}
        >
          <ThemedText style={sharedStyles.rowLabel}>
            {t("notifications.defaultReminder")}
          </ThemedText>
          <View style={styles.rowRight}>
            <ThemedText style={styles.rowValue}>{selectedLabel}</ThemedText>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </View>
        </TouchableOpacity>

        <RowDivider />

        <View style={sharedStyles.row}>
          <ThemedText style={sharedStyles.rowLabel}>
            {t("notifications.push")}
          </ThemedText>
          <Switch
            value={pushNotifications}
            onValueChange={handlePushToggle}
            trackColor={{ false: "#222", true: "rgba(0,240,255,0.35)" }}
            thumbColor={pushNotifications ? "#00F0FF" : "#555"}
          />
        </View>

        <RowDivider />

        <View style={sharedStyles.row}>
          <ThemedText style={sharedStyles.rowLabel}>
            {t("notifications.email")}
          </ThemedText>
          <Switch
            value={emailNotifications}
            onValueChange={handleEmailToggle}
            trackColor={{ false: "#222", true: "rgba(0,240,255,0.35)" }}
            thumbColor={emailNotifications ? "#00F0FF" : "#555"}
          />
        </View>

        <RowDivider />

        <TouchableOpacity
          style={sharedStyles.row}
          activeOpacity={0.7}
          onPress={handleTest}
          disabled={testing}
        >
          <ThemedText style={sharedStyles.rowLabel}>
            {testing ? t("notifications.testSending") : t("notifications.testSend")}
          </ThemedText>
          <ThemedText style={styles.chevron}>›</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
        transparent
        visible={dropdownOpen}
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: dropdownBg }]}>
            <ThemedText style={styles.dropdownTitle}>
              {t("notifications.dropdownTitle")}
            </ThemedText>
            {REMINDER_OPTIONS.map((opt, i) => (
              <React.Fragment key={opt.value}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    dispatch(setDefaultReminder(opt.value));
                    setDropdownOpen(false);
                  }}
                >
                  <ThemedText style={styles.dropdownItemText}>
                    {opt.label}
                  </ThemedText>
                  {defaultReminder === opt.value && (
                    <ThemedText style={styles.checkmark}>✓</ThemedText>
                  )}
                </TouchableOpacity>
                {i < REMINDER_OPTIONS.length - 1 && (
                  <View style={styles.dropdownDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 18,
    lineHeight: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    width: 260,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  dropdownTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#888",
    textAlign: "center",
    paddingVertical: 12,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 16,
    color: "#00F0FF",
    fontWeight: "700",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginHorizontal: 14,
  },
});
