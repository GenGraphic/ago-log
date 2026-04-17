import { APPWRITE_PROJECT_ID, auth, storage } from "@/appwrite";
import { HookResponse } from "@/models/types";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback } from "react";
import { ID, Permission, Role } from "react-native-appwrite";

const useStorage = () => {
  const getImagePreview = useCallback(
    async (bucketId: string, fileId: string): Promise<HookResponse<string>> => {
      try {
        const response = storage.getFilePreviewURL(bucketId, fileId);

        return {
          success: true,
          data: response.toString(),
        };
      } catch (error: any) {
        console.log("Error getting the image preview URL: ", error);
        return {
          success: false,
          message: error.message,
        };
      }
    },
    [],
  );

  const getPrivateImage = useCallback(
    async (bucketId: string, fileId: string): Promise<HookResponse<string>> => {
      try {
        const currentUser = await auth.getSession({ sessionId: "current" });

        const url = storage.getFileViewURL(bucketId, fileId);

        const res = await fetch(url, {
          headers: {
            "X-Appwrite-Project": APPWRITE_PROJECT_ID,
            "X-Appwrite-Session": currentUser.secret,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const blob = await res.blob();

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        return {
          success: true,
          data: base64,
        };
      } catch (error: any) {
        console.log("Error getting private image:", error);
        return {
          success: false,
          message: error.message,
        };
      }
    },
    [],
  );

  const getDownloadURL = useCallback(
    async (bucketId: string, fileId: string): Promise<HookResponse<URL>> => {
      try {
        const response = storage.getFileDownloadURL(bucketId, fileId);

        return {
          success: true,
          data: response,
        };
      } catch (error: any) {
        console.log("Error getting the download URL: ", error);
        return {
          success: false,
          message: error.message,
        };
      }
    },
    [],
  );

  const uploadImage = useCallback(
    async (bucketId: string, uri: string): Promise<HookResponse<string>> => {
      try {
        const currentUser = await auth.get();

        const info = await FileSystem.getInfoAsync(uri);
        if (!info.exists) throw new Error("File not found at URI: " + uri);

        const filename = uri.split("/").pop() ?? "upload.jpg";
        const file = {
          uri,
          name: filename,
          type: "image/jpeg",
          size: info.size,
        };

        const response = await storage.createFile({
          bucketId,
          fileId: ID.unique(),
          file: file as any,
          permissions: [
            Permission.read(Role.user(currentUser.$id)),
            Permission.update(Role.user(currentUser.$id)),
            Permission.delete(Role.user(currentUser.$id)),
          ],
        });

        return {
          success: true,
          data: response.$id,
        };
      } catch (error: any) {
        console.log("Error uploading the image: ", error);
        return {
          success: false,
          message: error.message,
        };
      }
    },
    [],
  );

  return {
    getDownloadURL,
    getImagePreview,
    uploadImage,
    getPrivateImage,
  };
};

export default useStorage;
