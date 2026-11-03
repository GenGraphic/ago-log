import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";

/**
 * Opens the right screen when the user taps a push notification:
 * an entry reminder opens the entry, the rest open their tab.
 */
export function useNotificationNavigation() {
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!response) return;
    const data = response.notification.request.content.data ?? {};
    if (typeof data.entryId === "string") {
      router.push(`/(main)/entry-details/${data.entryId}`);
    } else if (data.screen === "notifications") {
      router.push("/(main)/(tabs)/notifications");
    } else if (data.screen === "add") {
      router.push("/(main)/(tabs)/add");
    }
    Notifications.clearLastNotificationResponse();
  }, [response, router]);
}
