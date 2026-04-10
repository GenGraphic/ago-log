import { useThemeColor } from "@/hooks/useThemeColor";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TEAL = "#00F0FF";

const Logo = () => {
  const badgeBg = useThemeColor(
    { light: "#FFFFFF", dark: "#1C2333" },
    "background",
  );

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: badgeBg }]}>
        <Ionicons name="shield-half" size={64} color="#FFFFFF" />
        <View style={styles.dot} />
      </View>
      <Text style={styles.title}>AGO-LOG</Text>
      <View style={styles.underline} />
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: TEAL,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 3,
    marginTop: 20,
  },
  underline: {
    width: 50,
    height: 3,
    backgroundColor: TEAL,
    borderRadius: 2,
    marginTop: 6,
  },
});
