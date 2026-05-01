import { ASSETS_TABLE_ID, auth, db, DB_ID, idGen, query } from "@/appwrite";
import { toAsset } from "@/helpers/userHelper";
import { Asset, Asset_DB } from "@/models/assets";
import { HookResponse } from "@/models/types";
import { useCallback } from "react";
import { Permission, Role } from "react-native-appwrite";


const useAssets = () => {
  const createAsset = useCallback(async (newAsset: Asset_DB): Promise<HookResponse<Asset>> => {
    try {
      const currentUser = await auth.get();

      const result = await db.createRow({
        databaseId: DB_ID,
        tableId: ASSETS_TABLE_ID,
        rowId: idGen.unique(),
        data: newAsset,
        permissions: [
          Permission.read(Role.user(currentUser.$id)),
          Permission.update(Role.user(currentUser.$id)),
          Permission.delete(Role.user(currentUser.$id)),
        ],
      });
      return { success: true, data: toAsset(result as any) };
    } catch (error: any) {
      console.log("Error creating Asset:", error);
      return { success: false, message: error.message };
    }
  }, []);

  const getAsset = useCallback(async (assetId: string): Promise<HookResponse<Asset>> => {
    try {
      const result = await db.getRow({
        databaseId: DB_ID,
        tableId: ASSETS_TABLE_ID,
        rowId: assetId,
        queries: [
          query.select([
            "*",
            "entries.*"
          ]),
        ]
      });
      return { success: true, data: toAsset(result as any) };
    } catch (error: any) {
      console.log("Error getting Asset:", error);
      return { success: false, message: error.message };
    }
  }, []);

  const listAssets = useCallback(async (): Promise<HookResponse<Asset[]>> => {
    try {
      const result = await db.listRows({
        databaseId: DB_ID,
        tableId: ASSETS_TABLE_ID,
        queries: [
          query.select([
            "*",
            "entries.*"
          ]),
        ]
      });
      return { success: true, data: result.rows.map((row: any) => toAsset(row)) };
    } catch (error: any) {
      console.log("Error listing Assets:", error);
      return { success: false, message: error.message };
    }
  }, []);

  const updateAsset = useCallback(async (updatedAsset: Partial<Asset>, assetId: string): Promise<HookResponse<Asset>> => {
    try {

      const result = await db.updateRow({
        databaseId: DB_ID,
        tableId: ASSETS_TABLE_ID,
        rowId: assetId,
        data: updatedAsset,
      });
      return { success: true, data: toAsset(result as any) };
    } catch (error: any) {
      console.log("Error updating Asset:", error);
      return { success: false, message: error.message };
    }
  }, []);

  const deleteAsset = useCallback(async (assetId: string): Promise<HookResponse<null>> => {
    try {
      await db.deleteRow({
        databaseId: DB_ID,
        tableId: ASSETS_TABLE_ID,
        rowId: assetId,
      });
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
    deleteAsset,
  };
};

export default useAssets;
