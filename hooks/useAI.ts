import { functions, HANDLE_ENTRY_IMAGE } from "@/appwrite";
import { EntryAIPrefill, HookResponse } from "@/models/types";
import { useCallback, useRef } from "react";
import { ExecutionMethod } from "react-native-appwrite";

const CLIENT_COOLDOWN_MS = 10_000; // 10 seconds between calls

const useAI = () => {
  const lastCallRef = useRef<number>(0);

  const extractEntryFromImage = useCallback(
    async (base64Image: string): Promise<HookResponse<EntryAIPrefill>> => {
      const now = Date.now();
      if (now - lastCallRef.current < CLIENT_COOLDOWN_MS) {
        return {
          success: false,
          message: "Please wait a moment before trying again.",
        };
      }
      lastCallRef.current = now;
      try {
        const execution = await functions.createExecution({
          functionId: HANDLE_ENTRY_IMAGE,
          body: JSON.stringify({ image: base64Image }),
          async: false,
          method: ExecutionMethod.POST,
        });

        const result: HookResponse<EntryAIPrefill> = JSON.parse(
          execution.responseBody,
        );
        return result;
      } catch (error: any) {
        console.log("Error extracting entry from image: ", error);
        return {
          success: false,
          message: error.message,
        };
      }
    },
    [],
  );

  return {
    extractEntryFromImage,
  };
};

export default useAI;
