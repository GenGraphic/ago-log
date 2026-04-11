import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export function EntryDetailsFooter({ onEdit, onDelete }: Props) {
  const tint = useThemeColor({}, "tint");

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.editBtn, { borderColor: tint }]}
        onPress={onEdit}
      >
        <Feather name="edit-2" size={16} color={tint} />
        <ThemedText style={[styles.editBtnText, { color: tint }]}>EDIT</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Feather name="trash-2" size={16} color="#fff" />
        <ThemedText style={styles.deleteBtnText}>DELETE</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
