import { getCalendars, getLocales } from "expo-localization";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";

import { COLLECTIONS, db } from "@/firebase";
import { useAppSelector } from "@/store/hooks";

/**
 * Keeps language, country and time zone on the user profile, so the backend
 * writes notifications in the app's language and looks up information
 * (taxes, mandatory insurance, ...) for the user's country.
 */
export function useSyncUserLocale(userId: string | undefined) {
  const language = useAppSelector((s) => s.preferences.language);

  useEffect(() => {
    if (!userId) return;
    const country = getLocales()[0]?.regionCode ?? null;
    const timeZone = getCalendars()[0]?.timeZone ?? null;
    updateDoc(doc(db, COLLECTIONS.users, userId), { language, country, timeZone }).catch(
      (err) => console.log("syncUserLocale error:", err?.message ?? err),
    );
  }, [userId, language]);
}
