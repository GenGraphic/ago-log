import { usePushToken } from "@/hooks/usePushToken";
import useUser from "@/hooks/useUser";
import { useAppSelector } from "@/store/hooks";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

const MainLayout = () => {
  const { isAuth } = useAppSelector((state) => state.auth);
  const { getUser } = useUser();
  const { registerPushToken } = usePushToken();

  useEffect(() => {
    if (isAuth) {
      getUser().then((res) => {
        if (res.success && res.data) {
          registerPushToken(res.data.id);
        }
      });
    }
  }, [isAuth]);

  if (!isAuth) return <Redirect href="/(auth)" />;

  return (
    <Stack initialRouteName="(tabs)">
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="entry-details" options={{ headerShown: false }} />
      <Stack.Screen name="edit-entry" options={{ headerShown: false }} />
      <Stack.Screen name="add-entry" options={{ headerShown: false }} />
      <Stack.Screen name="mfa-setup" options={{ headerShown: false }} />
      <Stack.Screen name="upgrade" options={{ headerShown: false }} />

      <Stack.Screen name="addAsset" options={{ headerShown: false }} />
      <Stack.Screen name="editAsset/[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default MainLayout;
