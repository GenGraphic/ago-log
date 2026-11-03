import { COLLECTIONS, db, requireUid } from "@/firebase";
import { toAsset, toEntry } from "@/helpers/userHelper";
import { Asset, Asset_DB } from "@/models/assets";
import { Entry, HookResponse } from "@/models/types";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback } from "react";

const assetsCol = () => collection(db, COLLECTIONS.assets);

/** Loads the linked entries (Firestore `in` accepts max 30 values per query). */
async function loadEntries(ids: string[]): Promise<Entry[]> {
  if (!ids.length) return [];
  const uid = requireUid();
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));

  const results = await Promise.all(
    chunks.map((chunk) =>
      getDocs(
        query(
          collection(db, COLLECTIONS.entries),
          where("userId", "==", uid),
          where(documentId(), "in", chunk),
        ),
      ),
    ),
  );
  return results.flatMap((snap) => snap.docs.map(toEntry));
}

/** `entries` may come as Entry objects or ids — Firestore stores only ids. */
function toEntryIds(entries: Asset["entries"]): string[] | undefined {
  if (!Array.isArray(entries)) return undefined;
  const ids = entries
    .map((e) => (typeof e === "string" ? e : e?.id))
    .filter((id): id is string => Boolean(id));
  return Array.from(new Set(ids));
}

const useAssets = () => {
  const createAsset = useCallback(async (newAsset: Asset_DB): Promise<HookResponse<Asset>> => {
    try {
      const uid = requireUid();
      const ref = await addDoc(assetsCol(), {
        ...newAsset,
        userId: uid,
        entries: [],
        createdAt: new Date().toISOString(),
      });
      return { success: true, data: toAsset(await getDoc(ref)) };
    } catch (error: any) {
      console.log("Error creating Asset:", error);
      return { success: false, message: error.message };
    }
  }, []);

  const getAsset = useCallback(async (assetId: string): Promise<HookResponse<Asset>> => {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.assets, assetId));
      if (!snap.exists()) throw new Error("Asset not found.");
      const ids: string[] = snap.data().entries ?? [];
      const entries = await loadEntries(ids);
      return { success: true, data: toAsset(snap, entries) };
    } catch (error: any) {
      console.log("Error getting Asset:", error);
      return { success: false, message: error.message };
    }
  }, []);

  // The list only needs the number of linked entries, so ids are enough.
  const listAssets = useCallback(async (): Promise<HookResponse<Asset[]>> => {
    try {
      const snap = await getDocs(query(assetsCol(), where("userId", "==", requireUid())));
      return { success: true, data: snap.docs.map((d) => toAsset(d)) };
    } catch (error: any) {
      console.log("Error listing Assets:", error);
      return { success: false, message: error.message };
    }
  }, []);

  const updateAsset = useCallback(
    async (updatedAsset: Partial<Asset>, assetId: string): Promise<HookResponse<Asset>> => {
      try {
        const { id: _id, createdAt: _c, userId: _u, entries, ...rest } = updatedAsset;
        const data: Record<string, any> = { ...rest };
        const entryIds = toEntryIds(entries);
        if (entryIds) data.entries = entryIds;

        const ref = doc(db, COLLECTIONS.assets, assetId);
        await updateDoc(ref, data);
        const snap = await getDoc(ref);
        const linked = await loadEntries(snap.data()?.entries ?? []);
        return { success: true, data: toAsset(snap, linked) };
      } catch (error: any) {
        console.log("Error updating Asset:", error);
        return { success: false, message: error.message };
      }
    },
    [],
  );

  /** Adds an entry to the asset's linked entries. */
  const linkEntry = useCallback(async (assetId: string, entryId: string): Promise<HookResponse<null>> => {
    try {
      await updateDoc(doc(db, COLLECTIONS.assets, assetId), { entries: arrayUnion(entryId) });
      return { success: true, data: null };
    } catch (error: any) {
      console.log("Error linking entry to Asset:", error);
      return { success: false, message: error.message };
    }
  }, []);

  const deleteAsset = useCallback(async (assetId: string): Promise<HookResponse<null>> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.assets, assetId));
      return { success: true, data: null };
    } catch (error: any) {
      console.log("Error deleting Asset:", error);
      return { success: false, message: error.message };
    }
  }, []);

  return {
    createAsset,
    getAsset,
    listAssets,
    updateAsset,
    linkEntry,
    deleteAsset,
  };
};

export default useAssets;
