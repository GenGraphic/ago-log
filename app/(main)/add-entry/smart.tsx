import Feather from "@expo/vector-icons/Feather";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function CameraScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [capturing, setCapturing] = useState(false);

  const tint = useThemeColor({}, "tint");
  const icon = useThemeColor({}, "icon");
  const screenBg = useThemeColor(
    { light: "#F6F6F6", dark: "#000000" },
    "background",
  );

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: false,
        quality: 1,
      });
      // Pass the photo URI to manual screen via query param; AI prefill happens there
      router.replace({
        pathname: "/(main)/add-entry/manual",
        params: { photoUri: photo?.uri },
      });
    } finally {
      setCapturing(false);
    }
  };

  const toggleFacing = () =>
    setFacing((f) => (f === "back" ? "front" : "back"));
  const toggleFlash = () => setFlash((f) => (f === "off" ? "on" : "off"));

  // Permission not yet determined
  if (!permission)
    return <View style={[styles.fill, { backgroundColor: screenBg }]} />;

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView
        style={[styles.fill, styles.center, { backgroundColor: screenBg }]}
      >
        <Feather name="camera-off" size={48} color={icon} />
        <ThemedText style={[styles.permissionText, { color: icon }]}>
          {t('smart.cameraRequired')}
        </ThemedText>
        <TouchableOpacity
          style={[styles.permissionBtn, { borderColor: tint }]}
          onPress={requestPermission}
        >
          <ThemedText style={{ color: tint }}>{t('smart.grantPermission')}</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView
        ref={cameraRef}
        style={styles.fill}
        facing={facing}
        flash={flash}
      />

      {/* Overlay */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Top bar */}
        <SafeAreaView edges={["top"]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.back()}
            >
              <Feather name="x" size={22} color="#fff" />
            </TouchableOpacity>

            <ThemedText style={styles.topLabel}>{t('smart.scanDocument')}</ThemedText>

            <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash}>
              <Feather
                name={flash === "on" ? "zap" : "zap-off"}
                size={22}
                color={flash === "on" ? tint : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Viewfinder frame */}
        <View style={styles.frameWrapper} pointerEvents="none">
          <View
            style={[styles.frameCorner, styles.tl, { borderColor: tint }]}
          />
          <View
            style={[styles.frameCorner, styles.tr, { borderColor: tint }]}
          />
          <View
            style={[styles.frameCorner, styles.bl, { borderColor: tint }]}
          />
          <View
            style={[styles.frameCorner, styles.br, { borderColor: tint }]}
          />
        </View>

        {/* Hint */}
        <ThemedText style={[styles.hint, { color: `${tint}CC` }]}>
          {t('smart.alignFrame')}
        </ThemedText>

        {/* Bottom controls */}
        <SafeAreaView edges={["bottom"]}>
          <View style={styles.bottomBar}>
            {/* Flip camera */}
            <TouchableOpacity style={styles.sideBtn} onPress={toggleFacing}>
              <Feather name="refresh-cw" size={22} color="#fff" />
            </TouchableOpacity>

            {/* Shutter */}
            <TouchableOpacity
              style={[styles.shutter, { borderColor: tint }]}
              onPress={handleCapture}
              disabled={capturing}
              activeOpacity={0.8}
            >
              {capturing ? (
                <ActivityIndicator color={tint} />
              ) : (
                <View
                  style={[styles.shutterInner, { backgroundColor: tint }]}
                />
              )}
            </TouchableOpacity>

            {/* Manual fallback */}
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => router.replace("/(main)/add-entry/manual")}
            >
              <Feather name="edit-2" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const CORNER = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 16 },
  // Permission
  permissionText: { fontSize: 16, marginTop: 12 },
  permissionBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  topLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  // Frame corners — A4 proportions (width : height ≈ 1 : 1.414)
  frameWrapper: {
    position: "absolute",
    left: "6%",
    right: "6%",
    top: "15%",
    bottom: "9%",
  },
  frameCorner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderWidth: CORNER_THICKNESS,
  },
  tl: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  tr: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  br: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  // Hint
  hint: {
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  // Bottom bar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});
