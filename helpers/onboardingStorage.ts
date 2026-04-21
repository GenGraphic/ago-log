import * as FileSystem from "expo-file-system/legacy";

const FLAG_FILE = `${FileSystem.documentDirectory}onboarding_seen`;

export const markOnboardingSeen = (): Promise<void> =>
  FileSystem.writeAsStringAsync(FLAG_FILE, "1");

export const hasSeenOnboarding = async (): Promise<boolean> => {
  const info = await FileSystem.getInfoAsync(FLAG_FILE);
  return info.exists;
};
