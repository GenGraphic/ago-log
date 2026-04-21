import { hasSeenOnboarding } from "@/helpers/onboardingStorage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

import Loading from "@/components/Loading";
import { useAppSelector } from "@/store/hooks";

export default function Index() {
  const { isAuth, isLoading: authLoading } = useAppSelector(
    (state) => state.auth
  );
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  useEffect(() => {
    hasSeenOnboarding().then((seen) => {
      setOnboardingSeen(seen);
      setOnboardingChecked(true);
    });
  }, []);

  if (authLoading || !onboardingChecked) return <Loading />;

  if (isAuth) return <Redirect href="/(main)/(tabs)" />;

  if (!onboardingSeen) return <Redirect href="/onboarding" />;

  return <Redirect href="/(auth)" />;
}
