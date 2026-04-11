import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  uri: string;
}

export function EntryImageViewer({ uri }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setFullscreen(true)}
        style={styles.wrapper}
      >
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
        <View style={styles.expandBadge}>
          <Feather name="maximize-2" size={14} color="#fff" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={fullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreen(false)}
        statusBarTranslucent
      >
        <StatusBar hidden />
        <View style={styles.fsOverlay}>
          <Image source={{ uri }} style={styles.fsImage} contentFit="contain" />
          <TouchableOpacity
            style={styles.fsCloseBtn}
            onPress={() => setFullscreen(false)}
          >
            <Feather name="x" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginBottom: 20 },
  image: { width: "100%", height: 180, borderRadius: 12 },
  expandBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    padding: 6,
  },
  fsOverlay: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fsImage: { width: "100%", height: "100%" },
  fsCloseBtn: {
    position: "absolute",
    top: 48,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 10,
  },
});
