import { auth, db, DB_ID, idGen, USERS_TABLE_ID } from "@/appwrite";
import { toUser } from "@/helpers/userHelper";
import { HookResponse, User, User_DB } from "@/models/types";
import { useAppDispatch } from "@/store/hooks";
import { setUser, updateUser } from "@/store/slices/userSlice";
import { useCallback } from "react";
import { Permission, Role } from "react-native-appwrite";

const useUser = () => {
  const dispatch = useAppDispatch();

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
      const currentUser = await auth.get();

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
      console.log("Error updating user data:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }, []);

  const getUser = useCallback(async (): Promise<HookResponse<User>> => {
    try {
      const currentUser = await auth.get();

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
      console.log("There was an error getting the user", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }, []);

  return {
    createUser,
    getUser,
    updateUserData,
  };
};

export default useUser;
