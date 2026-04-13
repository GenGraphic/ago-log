import { Redirect } from "expo-router";
import React from "react";

import Loading from "@/components/Loading";
import { useAppSelector } from "@/store/hooks";

export default function Index() {
  const { isAuth, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) return <Loading />;

  if (isAuth) return <Redirect href="/(main)/(tabs)" />;

  return <Redirect href="/(auth)" />;
}
