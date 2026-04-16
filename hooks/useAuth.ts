import { auth, db, DB_ID, idGen, USERS_TABLE_ID } from "@/appwrite";
import { toUser } from "@/helpers/userHelper";
import { HookResponse } from "@/models/types";
import { useAppDispatch } from "@/store/hooks";
import { setAuthLoading, setAuthState } from "@/store/slices/authSlice";
import { setUser } from "@/store/slices/userSlice";
import { useCallback } from "react";

const useAuth = () => {
  const dispatch = useAppDispatch();

  const sendOtp = useCallback(
    async (email: string): Promise<HookResponse<string>> => {
      try {
        const response = await auth.createEmailToken({
          userId: idGen.unique(),
          email,
        });

        return {
          success: true,
          data: response.userId,
        };
      } catch (error: any) {
        console.log("There was an error sendOtp: ", error);
        return {
          success: false,
          message: error.message,
        };
      }
    },
    [],
  );

  const validateOtp = useCallback(
    async (userID: string, secret: string): Promise<HookResponse<string>> => {
      try {
        const response = await auth.createSession({
          userId: userID,
          secret: secret,
        });

        dispatch(setAuthState(true));
        return {
          success: true,
          data: response.$id,
        };
      } catch (error: any) {
        console.log("There was an error validateOtp: ", error);
        return {
          success: false,
          message: error.message,
        };
      }
    },
    [],
  );

  const signOut = useCallback(async (): Promise<HookResponse<null>> => {
    try {
      await auth.deleteSession({
        sessionId: "current",
      });

      dispatch(setAuthState(false));

      return {
        success: true,
        data: null,
      };
    } catch (error: any) {
      console.log("There was an error signOut: ", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<HookResponse<null>> => {
    try {
      await auth.updateStatus();
      dispatch(setAuthState(false));

      return {
        success: true,
        data: null,
      };
    } catch (error: any) {
      console.log("There was an error deleteAccount: ", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }, []);

  const checkUserPresence = useCallback(async (): Promise<
    HookResponse<null>
  > => {
    try {
      const authUser = await auth.get();
      console.log(authUser);
      dispatch(setAuthState(true));

      const response = await db.getRow({
        databaseId: DB_ID,
        tableId: USERS_TABLE_ID,
        rowId: authUser.$id,
      });
      dispatch(setUser(toUser(response)));

      return { success: true, data: null };
    } catch (error: any) {
      console.log("There was an error in checkUserPresence: ", error);
      return { success: false, message: error.message };
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, []);

  return {
    sendOtp,
    validateOtp,
    signOut,
    deleteAccount,
    checkUserPresence,
  };
};

export default useAuth;
