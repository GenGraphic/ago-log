import { auth, db, DB_ID, ENTRIES_TABLE_ID, idGen, query } from "@/appwrite";
import { toEntry } from "@/helpers/userHelper";
import { Entry, Entry_DB, HookResponse } from "@/models/types";
import { useCallback } from "react";
import { Permission, Role } from "react-native-appwrite";

const useEntries = () => {

    const createEntry = useCallback(async(newEntry: Entry_DB): Promise<HookResponse<Entry>> => {
        try {
            const currentUser = await auth.get();
            
            const result = await db.createRow({
                databaseId: DB_ID,
                tableId: ENTRIES_TABLE_ID,
                rowId: idGen.unique(),
                data: newEntry,
                permissions: [
                    Permission.read(Role.user(currentUser.$id)),
                    Permission.update(Role.user(currentUser.$id)),
                    Permission.delete(Role.user(currentUser.$id)),
                ]
            });

            const entry = toEntry(result);

            return {
                success: true,
                data: entry,
            }
        }catch(error: any) {
            console.log("Error creating new Entry: ", error);
            return {
                success: false,
                message: error.message,
            }
        }
    }, []);

    const getEntry = useCallback(async(entryId: string): Promise<HookResponse<Entry>> => {
        try {
            const result = await db.getRow({
                databaseId: DB_ID,
                tableId: ENTRIES_TABLE_ID,
                rowId: entryId,
            });

            const entry = toEntry(result);

            return {
                success: true,
                data: entry,
            }
        }catch(error: any) {
            console.log("Error getting the Entry: ", error);
            return {
                success: false,
                message: error.message,
            }
        }
    }, []);

    const countEntries = useCallback(async (): Promise<HookResponse<number>> => {
        try {
            const result = await db.listRows({
                databaseId: DB_ID,
                tableId: ENTRIES_TABLE_ID,
                queries: [query.limit(1)],
            });

            return { success: true, data: result.total };
        } catch (error: any) {
            console.log("Error counting entries: ", error);
            return { success: false, message: error.message };
        }
    }, []);

    const listEntries = useCallback(async(): Promise<HookResponse<Entry[]>> => {
        try {
            const result = await db.listRows({
                databaseId: DB_ID,
                tableId: ENTRIES_TABLE_ID,
            });

            const entries = result.rows.map((doc) => toEntry(doc));

            return {
                success: true,
                data: entries,
            }
        }catch(error: any) {
            console.log("Error getting the Entry: ", error);
            return {
                success: false,
                message: error.message,
            }
        }
    }, []);

    const queryEntries = useCallback(async(queryList: string[]): Promise<HookResponse<Entry[]>> => {
        try {
            const result = await db.listRows({
                databaseId: DB_ID,
                tableId: ENTRIES_TABLE_ID,
                queries: queryList
            });

            const entries = result.rows.map((doc) => toEntry(doc));

            return {
                success: true,
                data: entries,
            }
        }catch(error: any) {
            console.log("Error getting the Entry: ", error);
            return {
                success: false,
                message: error.message,
            }
        }
    }, []);

    const updateEntry = useCallback(async(updatedEntry: Partial<Entry_DB>, entryId: string): Promise<HookResponse<Entry>> => {
        try {
            const result = await db.updateRow({
                databaseId: DB_ID,
                tableId: ENTRIES_TABLE_ID,
                rowId: entryId,
                data: updatedEntry,
            });

            const entry = toEntry(result);

            return {
                success: true,
                data: entry,
            }
        }catch(error: any) {
            console.log("Error updateing the Entry: ", error);
            return {
                success: false,
                message: error.message,
            }
        }
    }, []);

    const deleteEntry = useCallback(async(entryId: string): Promise<HookResponse<null>> => {
        try {
            await db.deleteRow({
                databaseId: DB_ID,
                tableId: ENTRIES_TABLE_ID,
                rowId: entryId,
            });

            return {
                success: true,
                data: null,
            }
        }catch(error: any) {
            console.log("Error deleting the Entry: ", error);
            return {
                success: false,
                message: error.message,
            }
        }
    }, []);

    return {
        createEntry,
        getEntry,
        listEntries,
        queryEntries,
        countEntries,
        updateEntry,
        deleteEntry
    }
};

export default useEntries;