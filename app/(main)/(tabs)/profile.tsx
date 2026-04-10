import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AnimatedBackground from "@/components/AnimatedBackground";
import { AppSettingsSection } from "@/components/profile/AppSettingsSection";
import { DataSection } from "@/components/profile/DataSection";
import { IntelligenceLoad } from "@/components/profile/IntelligenceLoad";
import { NotificationsSection } from "@/components/profile/NotificationsSection";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SecuritySection } from "@/components/profile/SecuritySection";
import { SupportSection } from "@/components/profile/SupportSection";
import { LimitBanner } from "@/components/upgrade/LimitBanner";
import globalStyles from "@/constants/GlobalStyles";
import useAuth from "@/hooks/useAuth";
import { useFreeLimitReached } from "@/hooks/useFreeLimitReached";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const limitStatus = useFreeLimitReached();

  const handleSignOut = () => {
    Alert.alert(
      "Terminate Session",
      "All local data will be cleared. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Terminate",
          style: "destructive",
          onPress: async () => {
            const result = await signOut();
            if (result.success) {
              router.replace("/(auth)");
            } else {
              Alert.alert("Error", result.message);
            }
          },
        },
      ],
    );
  };

  return (
    <AnimatedBackground style={globalStyles.body}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {limitStatus !== "none" && (
          <LimitBanner variant={limitStatus} style={{ marginTop: 8 }} />
        )}
        <ProfileHeader />
        <IntelligenceLoad />
        <NotificationsSection />
        <SecuritySection />
        <DataSection />
        <AppSettingsSection />
        <SupportSection />
        <TouchableOpacity
          style={styles.terminateBtn}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={styles.terminateText}>TERMINATE SESSION</Text>
        </TouchableOpacity>
      </ScrollView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  terminateBtn: {
    marginHorizontal: 16,
    marginTop: 6,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E1E1E",
    alignItems: "center",
  },
  terminateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6060",
    letterSpacing: 1.5,
  },
});
