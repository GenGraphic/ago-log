import React from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";

type AuthTitleBlockProps = {
  title: string;
  subtitle: string;
};

const AuthTitleBlock = ({ title, subtitle }: AuthTitleBlockProps) => {
  return (
    <>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
    </>
  );
};

export default AuthTitleBlock;

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
  },
});
