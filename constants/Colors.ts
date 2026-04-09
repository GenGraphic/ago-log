/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#00F0FF';
const tintColorDark = '#00F0FF';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F6F6F6',
    tint: tintColorLight,
    tintLight: "#DBFCFF",
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    tintLight: "#DBFCFF",
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Semantic status colors — consistent across light and dark
export const StatusColors = {
  active:   '#00F0FF',  // teal  — Active entries
  expired:  '#FF6060',  // salmon — Expired entries
  archived: '#7B8CFF',  // purple — Archived entries
};
