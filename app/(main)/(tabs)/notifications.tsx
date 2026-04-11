import AnimatedBackground from "@/components/AnimatedBackground";
import NotificationEmpty from "@/components/notifications/NotificationEmpty";
import NotificationFilterBar, {
  FilterKey,
} from "@/components/notifications/NotificationFilterBar";
import NotificationRow from "@/components/notifications/NotificationRow";
import NotificationSectionHeader from "@/components/notifications/NotificationSectionHeader";
import NotificationsHeader from "@/components/notifications/NotificationsHeader";
import { groupIntoSections } from "@/components/notifications/notificationUtils";
import { LimitBanner } from "@/components/upgrade/LimitBanner";
import globalStyles from "@/constants/GlobalStyles";
import { useFreeLimitReached } from "@/hooks/useFreeLimitReached";
import { useNotifications } from "@/hooks/useNotifications";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const limitStatus = useFreeLimitReached();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");

  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case "UNREAD":
        return notifications.filter((n) => !n.read);
      case "EXPIRED":
        return notifications.filter((n) => n.type === "expired");
      case "UPCOMING":
        return notifications.filter((n) => n.type === "warning");
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const sections = useMemo(() => groupIntoSections(filtered), [filtered]);

  return (
    <AnimatedBackground style={globalStyles.body}>
      <SafeAreaView>
        <NotificationsHeader
          unreadCount={unreadCount}
          onMarkAllRead={markAllAsRead}
        />

        {limitStatus !== "none" && (
          <LimitBanner
            variant={limitStatus}
            style={{ marginTop: -8, marginBottom: 12 }}
          />
        )}

        <NotificationFilterBar
          activeFilter={activeFilter}
          unreadCount={unreadCount}
          onSelect={setActiveFilter}
        />

        {loading && !notifications.length ? (
          <ActivityIndicator color="#00F0FF" style={{ marginTop: 40 }} />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchNotifications}
                tintColor="#00F0FF"
                colors={["#00F0FF"]}
              />
            }
            renderSectionHeader={({ section }) => (
              <NotificationSectionHeader title={section.title} />
            )}
            renderItem={({ item }) => (
              <NotificationRow
                item={item}
                onPress={(id) => {
                  if (!item.read) markAsRead(id);
                }}
              />
            )}
            ListEmptyComponent={<NotificationEmpty />}
          />
        )}
      </SafeAreaView>
    </AnimatedBackground>
  );
}
