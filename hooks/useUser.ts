import { auth, db, DB_ID, idGen, USERS_TABLE_ID } from "@/appwrite";
import { toUser } from "@/helpers/userHelper";
import { HookResponse, User, User_DB } from "@/models/types";
import { useAppDispatch } from "@/store/hooks";
import { setUser, updateUser } from "@/store/slices/userSlice";
import { useCallback } from "react";
import { Permission, Role } from "react-native-appwrite";

const useUser = () => {
  const dispatch = useAppDispatch();

  const getCurrentUserWithRetry = useCallback(async () => {
    let lastError: any;

    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        return await auth.get();
      } catch (error) {
        lastError = error;
        const delayMs = 250 + attempt * 150;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw lastError;
  }, []);

  const isGuestScopeError = (error: any): boolean => {
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("missing scopes") &&
      (message.includes("account") || message.includes("role: guests"))
    );
  };

  const createUser = useCallback(async (user: User_DB, userId: string): Promise<HookResponse<User>> => {
    try {
      const response = await db.createRow({
        databaseId: DB_ID,
        tableId: USERS_TABLE_ID, 
        rowId: idGen.custom(userId), 
        data: user,
        permissions: [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
        ]
      });

      const newUser = toUser(response);

      return {
        success: true,
        data: newUser,
      };
    } catch (error: any) {
      console.log("There was an error creating user", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }, []);

  const updateUserData = useCallback(async (updatedUserPart: Partial<User_DB>): Promise<HookResponse<User>> => {
    try {
      const currentUser = await getCurrentUserWithRetry();

      const response = await db.updateRow({
        databaseId: DB_ID, 
        tableId: USERS_TABLE_ID, 
        rowId: currentUser.$id, 
        data: updatedUserPart
      });

      const user = toUser(response);

      dispatch(updateUser(user));

      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      if (!isGuestScopeError(error)) {
        console.log("Error updating user data:", error);
      }
      return {
        success: false,
        message: error.message,
      };
    }
  }, [getCurrentUserWithRetry]);

  const getUser = useCallback(async (): Promise<HookResponse<User>> => {
    try {
      const currentUser = await getCurrentUserWithRetry();

      const response = await db.getRow({
        databaseId: DB_ID, 
        tableId: USERS_TABLE_ID, 
        rowId: currentUser.$id
      });

      const user = toUser(response);

      dispatch(setUser(user));

      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      if (!isGuestScopeError(error)) {
        console.log("There was an error getting the user", error);
      }
      return {
        success: false,
        message: error.message,
      };
    }
  }, [getCurrentUserWithRetry]);

  return {
    createUser,
    getUser,
    updateUserData,
  };
};

export default useUser;
