import { functions, HANDLE_ENTRY_IMAGE } from "@/appwrite";
import { EntryAIPrefill, HookResponse } from "@/models/types";
import { useCallback } from "react";
import { ExecutionMethod } from "react-native-appwrite";

const useAI = () => {

    const extractEntryFromImage = useCallback(async (base64Image: string): Promise<HookResponse<EntryAIPrefill>> => {
        try {
            const execution = await functions.createExecution({
                functionId: HANDLE_ENTRY_IMAGE,
                body: JSON.stringify({ image: base64Image }),
                async: false,
                method: ExecutionMethod.POST,
            });

            const result: HookResponse<EntryAIPrefill> = JSON.parse(execution.responseBody);
            return result;
        } catch (error: any) {
            console.log("Error extracting entry from image: ", error);
            return {
                success: false,
                message: error.message,
            };
        }
    }, []);

    return { 
        extractEntryFromImage 
    };
};

export default useAI;
