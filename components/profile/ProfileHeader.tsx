import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import useUser from "@/hooks/useUser";
import { UserPlan } from "@/models/enums";
import { useAppSelector } from "@/store/hooks";
import { ThemedText } from "../ThemedText";

export function ProfileHeader() {
  const user = useAppSelector((s) => s.user);
  const displayName = user.name || "Anonymous User";
  const displayEmail = user.email || "—";
  const { updateUserData } = useUser();
  const router = useRouter();
  const isPro = user.plan === UserPlan.PRO;
  const avatarBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const sheetBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const inputBg = useThemeColor(
    { light: "#F3F4F6", dark: "#1E1E1E" },
    "background",
  );
  const neutralBtnBg = useThemeColor(
    { light: "#F3F4F6", dark: "#1E1E1E" },
    "background",
  );
  const text = useThemeColor({}, "text");
  const icon = useThemeColor({}, "icon");
  const avatarBorder = useThemeColor({ light: "#E0E0E0", dark: "#1E1E1E" }, "background");
  const inputBorder = useThemeColor({ light: "#E0E0E0", dark: "#2A2A2A" }, "background");

  const [modalVisible, setModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setNameInput(user.name ?? "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setSaving(true);
    const result = await updateUserData({ name: trimmed });
    setSaving(false);
    if (result.success) {
      setModalVisible(false);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  return (
    <View style={styles.block}>
      <View style={[styles.avatar, { backgroundColor: avatarBg, borderColor: avatarBorder }]}>
        <Feather name="user" size={36} color="#00F0FF" />
      </View>

      {/* Name row with edit icon */}
      <TouchableOpacity
        style={styles.nameRow}
        onPress={openEdit}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.name}>{displayName}</ThemedText>
        <Feather name="edit-2" size={14} color={icon} style={styles.editIcon} />
      </TouchableOpacity>

      <Text style={[styles.email, { color: text }]}>{displayEmail}</Text>

      {isPro ? (
        <View style={[styles.badge, styles.badgePro]}>
          <Text style={[styles.badgeText, styles.badgeTextPro]}>PRO</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => router.push("/(main)/upgrade")}
          activeOpacity={0.8}
        >
          <Text style={[styles.upgradeBtnLabel, { color: icon }]}>FREE</Text>
          <Feather name="zap" size={10} color="#00F0FF" />
          <Text style={styles.upgradeBtnCta}>UPGRADE</Text>
        </TouchableOpacity>
      )}

      {/* Edit name modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={[styles.sheet, { backgroundColor: sheetBg }]}
            activeOpacity={1}
          >
            <Text style={[styles.sheetTitle, { color: text }]}>Edit Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: inputBorder }]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={icon}
              autoFocus
              maxLength={60}
            />
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: neutralBtnBg }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelText, { color: icon }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#0D0D0D" />
                ) : (
                  <Text style={styles.saveText}>SAVE</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  editIcon: {
    marginTop: 2,
  },
  email: {
    fontSize: 12,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "rgba(0,240,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,240,255,0.3)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00F0FF",
    letterSpacing: 1.2,
  },
  badgePro: {
    backgroundColor: "rgba(0,240,255,0.18)",
    borderColor: "#00F0FF",
  },
  badgeTextPro: {
    color: "#00F0FF",
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(0,240,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,240,255,0.2)",
  },
  upgradeBtnLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  upgradeBtnCta: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00F0FF",
    letterSpacing: 1,
  },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#00F0FF",
    alignItems: "center",
  },
  saveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D0D0D",
    letterSpacing: 1,
  },
});
