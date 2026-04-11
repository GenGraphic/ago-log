import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Props {
  title: string;
  children: React.ReactNode;
}

export function DetailsSection({ title, children }: Props) {
  const tint = useThemeColor({}, "tint");
  const icon = useThemeColor({}, "icon");

  return (
    <View style={[styles.section, { borderColor: `${tint}18` }]}>
      <ThemedText style={[styles.sectionTitle, { color: `${icon}80` }]}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
});
