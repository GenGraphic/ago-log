import { useAppSelector } from "@/store/hooks";
import { useColorScheme as useSystemColorScheme } from "react-native";

export function useColorScheme() {
  const systemScheme = useSystemColorScheme();
  const theme = useAppSelector((s) => s.preferences.theme);

  if (theme === "system") return systemScheme;
  return theme;
}
