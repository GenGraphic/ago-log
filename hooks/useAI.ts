import { functions } from "@/firebase";
import { EntryAIPrefill, HookResponse } from "@/models/types";
import { httpsCallable } from "firebase/functions";
import { useCallback, useRef } from "react";

const CLIENT_COOLDOWN_MS = 10_000; // 10 seconds between calls

const extractFn = httpsCallable<{ image: string }, HookResponse<EntryAIPrefill>>(
  functions,
  "extractEntryFromImage",
  { timeout: 70_000 },
);

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
        const { data } = await extractFn({ image: base64Image });
        return data;
      } catch (error: any) {
        console.log("Error extracting entry from image: ", error);
        return { success: false, message: error.message };
      }
    },
    [],
  );

  return {
    extractEntryFromImage,
  };
};

export default useAI;
