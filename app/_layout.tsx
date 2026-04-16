import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

import useAuth from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import { useAppSelector } from "@/store/hooks";
import { store } from "@/store/store";

// Handles auth initialization (must be inside Provider)
function AuthInitializer() {
  const { checkUserPresence } = useAuth();

  useEffect(() => {
    checkUserPresence();
  }, [checkUserPresence]);

  return null;
}

// Configures RevenueCat SDK and links identity when user is authenticated
function PurchasesInitializer() {
  const { configure, logIn, loadCustomerInfo } = useRevenueCat();
  const userId = useAppSelector((s) => s.user.id);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuth);

  // Configure SDK once on mount (anonymous session to start)
  useEffect(() => {
    configure();
  }, [configure]);

  // Link RevenueCat identity when the user is authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      logIn(userId);
    } else if (!isAuthenticated) {
      loadCustomerInfo();
    }
  }, [isAuthenticated, userId, logIn, loadCustomerInfo]);

  return null;
}

// Wraps children with nav theme driven by the user preference
function ThemedApp({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {children}
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <AuthInitializer />
      <PurchasesInitializer />
      <ThemedApp>
        <Stack initialRouteName="index">
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemedApp>
    </Provider>
  );
}
