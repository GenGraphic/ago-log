import { auth, COLLECTIONS, db, functions } from "@/firebase";
import { toUser } from "@/helpers/userHelper";
import { HookResponse } from "@/models/types";
import { useAppDispatch } from "@/store/hooks";
import { setAuthLoading, setAuthState } from "@/store/slices/authSlice";
import { setUser } from "@/store/slices/userSlice";
import { onAuthStateChanged, signInWithCustomToken, signOut as fbSignOut, User as FbUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useCallback } from "react";

const sendOtpFn = httpsCallable<{ email: string }, { ok: boolean }>(functions, "sendOtp");
const verifyOtpFn = httpsCallable<{ email: string; code: string }, { token: string; uid: string }>(
  functions,
  "verifyOtp",
);
const deleteAccountFn = httpsCallable<void, { ok: boolean }>(functions, "deleteAccount");

/** Resolves once Firebase Auth has restored the persisted session (if any). */
function waitForAuthState(): Promise<FbUser | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

const useAuth = () => {
  const dispatch = useAppDispatch();

  // Sends a 6-digit code to the email. Returns the email (used as the
  // "userId" route param of the OTP screen).
  const sendOtp = useCallback(
    async (email: string): Promise<HookResponse<string>> => {
      try {
        const normalized = email.trim().toLowerCase();
        await sendOtpFn({ email: normalized });
        return { success: true, data: normalized };
      } catch (error: any) {
        console.log("There was an error sendOtp: ", error);
        return { success: false, message: error.message };
      }
    },
    [],
  );

  const validateOtp = useCallback(
    async (email: string, code: string): Promise<HookResponse<string>> => {
      try {
        const { data } = await verifyOtpFn({ email, code });
        const credential = await signInWithCustomToken(auth, data.token);

        dispatch(setAuthState(true));
        return { success: true, data: credential.user.uid };
      } catch (error: any) {
        console.log("There was an error validateOtp: ", error);
        return { success: false, message: error.message };
      }
    },
    [dispatch],
  );

  const signOut = useCallback(async (): Promise<HookResponse<null>> => {
    try {
      await fbSignOut(auth);
      dispatch(setAuthState(false));
      return { success: true, data: null };
    } catch (error: any) {
      console.log("There was an error signOut: ", error);
      return { success: false, message: error.message };
    }
  }, [dispatch]);

  const deleteAccount = useCallback(async (): Promise<HookResponse<null>> => {
    try {
      await deleteAccountFn();
      await fbSignOut(auth).catch(() => undefined);
      dispatch(setAuthState(false));
      return { success: true, data: null };
    } catch (error: any) {
      console.log("There was an error deleteAccount: ", error);
      return { success: false, message: error.message };
    }
  }, [dispatch]);

  const checkUserPresence = useCallback(async (): Promise<HookResponse<null>> => {
    try {
      const authUser = await waitForAuthState();
      if (!authUser) {
        dispatch(setAuthState(false));
        return { success: false, message: "Not signed in" };
      }
      dispatch(setAuthState(true));

      const snap = await getDoc(doc(db, COLLECTIONS.users, authUser.uid));
      if (snap.exists()) dispatch(setUser(toUser(snap)));

      return { success: true, data: null };
    } catch (error: any) {
      console.log("There was an error in checkUserPresence: ", error);
      return { success: false, message: error.message };
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

  return {
    sendOtp,
    validateOtp,
    signOut,
    deleteAccount,
    checkUserPresence,
  };
};

export default useAuth;
