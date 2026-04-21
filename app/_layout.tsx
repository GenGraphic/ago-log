import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

SplashScreen.preventAutoHideAsync();

import useAuth from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import "@/i18n";
import i18n from "@/i18n";
import { useAppSelector } from "@/store/hooks";
import { store } from "@/store/store";

// Keeps i18next language in sync with the Redux preference
function LanguageSyncer() {
  const language = useAppSelector((s) => s.preferences.language);
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);
  return null;
}

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
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Toast />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <LanguageSyncer />
      <AuthInitializer />
      <PurchasesInitializer />
      <ThemedApp>
        <Stack initialRouteName="index">
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemedApp>
    </Provider>
  );
}
