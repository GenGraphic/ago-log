import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuth: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuth: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<boolean>) => {
      state.isAuth = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setAuthState, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;