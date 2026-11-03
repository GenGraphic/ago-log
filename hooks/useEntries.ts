import { COLLECTIONS, db, requireUid } from "@/firebase";
import { normalizeDates, toEntry } from "@/helpers/userHelper";
import { Entry, Entry_DB, HookResponse } from "@/models/types";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query as fsQuery,
  QueryConstraint,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback } from "react";

const entriesCol = () => collection(db, COLLECTIONS.entries);

// Every query must be scoped to the current user — Firestore rules reject
// queries that could return other users' documents.
const userEntriesQuery = (...constraints: QueryConstraint[]) =>
  fsQuery(entriesCol(), where("userId", "==", requireUid()), ...constraints);

const useEntries = () => {
  const createEntry = useCallback(async (newEntry: Entry_DB): Promise<HookResponse<Entry>> => {
    try {
      const uid = requireUid();
      const now = new Date().toISOString();
      const ref = await addDoc(entriesCol(), {
        ...normalizeDates(newEntry),
        userId: uid,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, data: toEntry(await getDoc(ref)) };
    } catch (error: any) {
      console.log("Error creating new Entry: ", error);
      return { success: false, message: error.message };
    }
  }, []);

  const getEntry = useCallback(async (entryId: string): Promise<HookResponse<Entry>> => {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.entries, entryId));
      if (!snap.exists()) throw new Error("Entry not found.");
      return { success: true, data: toEntry(snap) };
    } catch (error: any) {
      console.log("Error getting the Entry: ", error);
      return { success: false, message: error.message };
    }
  }, []);

  const countEntries = useCallback(async (): Promise<HookResponse<number>> => {
    try {
      const snap = await getCountFromServer(userEntriesQuery());
      return { success: true, data: snap.data().count };
    } catch (error: any) {
      console.log("Error counting entries: ", error);
      return { success: false, message: error.message };
    }
  }, []);

  const listEntries = useCallback(async (): Promise<HookResponse<Entry[]>> => {
    try {
      const snap = await getDocs(userEntriesQuery());
      return { success: true, data: snap.docs.map(toEntry) };
    } catch (error: any) {
      console.log("Error getting the Entry: ", error);
      return { success: false, message: error.message };
    }
  }, []);

  // Build constraints with `query` from "@/firebase" (equal, orderAsc, limit, ...)
  const queryEntries = useCallback(
    async (queryList: QueryConstraint[]): Promise<HookResponse<Entry[]>> => {
      try {
        const snap = await getDocs(userEntriesQuery(...queryList));
        return { success: true, data: snap.docs.map(toEntry) };
      } catch (error: any) {
        console.log("Error getting the Entry: ", error);
        return { success: false, message: error.message };
      }
    },
    [],
  );

  const updateEntry = useCallback(
    async (updatedEntry: Partial<Entry_DB>, entryId: string): Promise<HookResponse<Entry>> => {
      try {
        const data: Record<string, any> = normalizeDates({ ...updatedEntry });
        delete data.userId;
        // A field left empty in the edit form arrives as undefined; Firestore
        // would skip it (ignoreUndefinedProperties), so remove it explicitly.
        for (const key of Object.keys(data)) {
          if (data[key] === undefined) data[key] = deleteField();
        }
        const ref = doc(db, COLLECTIONS.entries, entryId);
        await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
        return { success: true, data: toEntry(await getDoc(ref)) };
      } catch (error: any) {
        console.log("Error updateing the Entry: ", error);
        return { success: false, message: error.message };
      }
    },
    [],
  );

  const deleteEntry = useCallback(async (entryId: string): Promise<HookResponse<null>> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.entries, entryId));
      return { success: true, data: null };
    } catch (error: any) {
      console.log("Error deleting the Entry: ", error);
      return { success: false, message: error.message };
    }
  }, []);

  return {
    createEntry,
    getEntry,
    listEntries,
    queryEntries,
    countEntries,
    updateEntry,
    deleteEntry,
  };
};

export default useEntries;
