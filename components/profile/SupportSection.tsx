import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useRevenueCat } from "@/hooks/useRevenueCat";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Linking } from "react-native";
import { ThemedText } from "../ThemedText";
import { SectionLabel } from "./shared";

export function SupportSection() {
  const { t } = useTranslation();
  const { presentCustomerCenter, isPro } = useRevenueCat();
  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#141414" },
    "background",
  );
  const labelColor = useThemeColor({ light: "#555", dark: "#999" }, "icon");

  return (
    <>
      <SectionLabel title={t('profile.support')} />
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardBg }]}
          activeOpacity={0.7}
          onPress={() => Linking.openURL('https://ago-log.com/#faq')}
        >
          <Feather name="book-open" size={22} color="#00F0FF" />
          <ThemedText style={[styles.label, { color: labelColor }]}> 
            {t('profile.helpFaq')}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardBg }]}
          activeOpacity={0.7}
          onPress={() => Linking.openURL('https://ago-log.com/#contact')}
        >
          <Feather name="message-circle" size={22} color="#00F0FF" />
          <ThemedText style={[styles.label, { color: labelColor }]}> 
            {t('profile.contact')}
          </ThemedText>
        </TouchableOpacity>
        {isPro && (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
            onPress={presentCustomerCenter}
          >
            <Feather name="settings" size={22} color="#00F0FF" />
            <ThemedText style={[styles.label, { color: labelColor }]}>
              {t('profile.manageSub')}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
