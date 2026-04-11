import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { db, DB_ID, USERS_TABLE_ID } from "@/appwrite";
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

const REMINDER_OPTIONS: { label: string; value: ReminderDays }[] = [
  { label: "1 day before", value: 1 },
  { label: "7 days before", value: 7 },
  { label: "30 days before", value: 30 },
];

export function NotificationsSection() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.user.id);
  const { defaultReminder, pushNotifications, emailNotifications } =
    useAppSelector((s) => s.preferences);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const dropdownBg = useThemeColor(
    { light: "#FFFFFF", dark: "#1A1A1A" },
    "background",
  );

  const selectedLabel =
    REMINDER_OPTIONS.find((o) => o.value === defaultReminder)?.label ??
    "7 days before";

  async function handlePushToggle(v: boolean) {
    dispatch(setPushNotifications(v));
    if (userId)
      await db.updateRow({
        databaseId: DB_ID,
        tableId: USERS_TABLE_ID,
        rowId: userId,
        data: { pushEnabled: v },
      });
  }

  async function handleEmailToggle(v: boolean) {
    dispatch(setEmailNotifications(v));
    if (userId)
      await db.updateRow({
        databaseId: DB_ID,
        tableId: USERS_TABLE_ID,
        rowId: userId,
        data: { emailEnabled: v },
      });
  }

  return (
    <>
      <SectionLabel title="NOTIFICATIONS" />
      <View style={[sharedStyles.card, { backgroundColor: cardBg }]}>
        {/* Default Reminder Row */}
        <TouchableOpacity
          style={sharedStyles.row}
          activeOpacity={0.7}
          onPress={() => setDropdownOpen(true)}
        >
          <ThemedText style={sharedStyles.rowLabel}>Default reminder</ThemedText>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{selectedLabel}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        <RowDivider />

        <View style={sharedStyles.row}>
          <Text style={sharedStyles.rowLabel}>Push notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={handlePushToggle}
            trackColor={{ false: "#222", true: "rgba(0,240,255,0.35)" }}
            thumbColor={pushNotifications ? "#00F0FF" : "#555"}
          />
        </View>

        <RowDivider />

        <View style={sharedStyles.row}>
          <Text style={sharedStyles.rowLabel}>Email notifications</Text>
          <Switch
            value={emailNotifications}
            onValueChange={handleEmailToggle}
            trackColor={{ false: "#222", true: "rgba(0,240,255,0.35)" }}
            thumbColor={emailNotifications ? "#00F0FF" : "#555"}
          />
        </View>
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
            <Text style={styles.dropdownTitle}>DEFAULT REMINDER</Text>
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
                  <Text style={styles.dropdownItemText}>{opt.label}</Text>
                  {defaultReminder === opt.value && (
                    <Text style={styles.checkmark}>✓</Text>
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
    color: "#555",
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
    color: "#CCCCCC",
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
