import { COLLECTIONS, db, requireUid } from "@/firebase";
import { toUser } from "@/helpers/userHelper";
import { HookResponse, User, User_DB } from "@/models/types";
import { useAppDispatch } from "@/store/hooks";
import { setUser, updateUser } from "@/store/slices/userSlice";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback } from "react";

// Fields only the backend may change (see firebase/firestore.rules)
const SERVER_ONLY_FIELDS = ["plan", "status", "email", "createdAt"] as const;

const useUser = () => {
  const dispatch = useAppDispatch();

  const updateUserData = useCallback(
    async (updatedUserPart: Partial<User_DB>): Promise<HookResponse<User>> => {
      try {
        const uid = requireUid();
        const data: Record<string, any> = { ...updatedUserPart };
        SERVER_ONLY_FIELDS.forEach((f) => delete data[f]);

        const ref = doc(db, COLLECTIONS.users, uid);
        await updateDoc(ref, data);
        const user = toUser(await getDoc(ref));

        dispatch(updateUser(user));
        return { success: true, data: user };
      } catch (error: any) {
        console.log("Error updating user data:", error);
        return { success: false, message: error.message };
      }
    },
    [dispatch],
  );

  const getUser = useCallback(async (): Promise<HookResponse<User>> => {
    try {
      const uid = requireUid();
      const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
      if (!snap.exists()) throw new Error("User profile not found.");

      const user = toUser(snap);
      dispatch(setUser(user));
      return { success: true, data: user };
    } catch (error: any) {
      console.log("There was an error getting the user", error);
      return { success: false, message: error.message };
    }
  }, [dispatch]);

  return {
    getUser,
    updateUserData,
  };
};

export default useUser;
