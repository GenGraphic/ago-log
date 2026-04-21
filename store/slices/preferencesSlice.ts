import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ReminderDays = 1 | 7 | 30;
export type AppLanguage = 'en' | 'ro';
export type AppTheme = 'dark' | 'light' | 'system';

export interface UserPreferences {
  defaultReminder: ReminderDays;
  pushNotifications: boolean;
  emailNotifications: boolean;
  language: AppLanguage;
  theme: AppTheme;
}

const initialState: UserPreferences = {
  defaultReminder: 7,
  pushNotifications: true,
  emailNotifications: false,
  language: 'en',
  theme: 'dark',
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setDefaultReminder(state, action: PayloadAction<ReminderDays>) {
      state.defaultReminder = action.payload;
    },
    setPushNotifications(state, action: PayloadAction<boolean>) {
      state.pushNotifications = action.payload;
    },
    setEmailNotifications(state, action: PayloadAction<boolean>) {
      state.emailNotifications = action.payload;
    },
    setLanguage(state, action: PayloadAction<AppLanguage>) {
      state.language = action.payload;
    },
    setTheme(state, action: PayloadAction<AppTheme>) {
      state.theme = action.payload;
    },
    resetPreferences() {
      return initialState;
    },
  },
});

export const {
  setDefaultReminder,
  setPushNotifications,
  setEmailNotifications,
  setLanguage,
  setTheme,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
