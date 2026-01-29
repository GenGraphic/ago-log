import { create } from "zustand";

interface AuthState {
    isAuth: boolean;
    setState: (isAuth: boolean) => void;
}

const useAuthState = create<AuthState>((set) => ({
    isAuth: false,
    setState: (isAuth) => set({ isAuth }),
}));

export default useAuthState;