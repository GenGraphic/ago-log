import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

const Logo = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo_no_bg.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ThemedText style={styles.appName}>AGO LOG</ThemedText>
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 160,
  },
  appName: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
});
