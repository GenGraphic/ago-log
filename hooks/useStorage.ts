import { requireUid, storage } from "@/firebase";
import { HookResponse } from "@/models/types";
import { deleteObject, getDownloadURL as fbGetDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useCallback } from "react";

// Files live at users/{uid}/{folder}/{fileId}.jpg (see firebase/storage.rules)
const filePath = (uid: string, folder: string, fileId: string) =>
  `users/${uid}/${folder}/${fileId}.jpg`;

const newFileId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

// fetch(uri).blob() is unreliable for local files in React Native; XHR works.
function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new TypeError("Could not read the file: " + uri));
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

const useStorage = () => {
  /** Returns an https URL that can be used directly in <Image source={{ uri }} />. */
  const getDownloadURL = useCallback(
    async (folder: string, fileId: string): Promise<HookResponse<string>> => {
      try {
        const url = await fbGetDownloadURL(ref(storage, filePath(requireUid(), folder, fileId)));
        return { success: true, data: url };
      } catch (error: any) {
        console.log("Error getting the download URL: ", error);
        return { success: false, message: error.message };
      }
    },
    [],
  );

  // Kept for compatibility with existing screens — both return the download URL.
  const getImagePreview = getDownloadURL;
  const getPrivateImage = getDownloadURL;

  /** Uploads a local image and returns its fileId (stored in entry.imageId). */
  const uploadImage = useCallback(
    async (folder: string, uri: string): Promise<HookResponse<string>> => {
      try {
        const uid = requireUid();
        const fileId = newFileId();
        const blob = await uriToBlob(uri);
        await uploadBytes(ref(storage, filePath(uid, folder, fileId)), blob, {
          contentType: "image/jpeg",
        });
        return { success: true, data: fileId };
      } catch (error: any) {
        console.log("Error uploading the image: ", error);
        return { success: false, message: error.message };
      }
    },
    [],
  );

  /** Deletes a stored image, e.g. a replaced receipt photo. Missing files are ignored. */
  const deleteImage = useCallback(
    async (folder: string, fileId: string): Promise<HookResponse<null>> => {
      try {
        await deleteObject(ref(storage, filePath(requireUid(), folder, fileId)));
        return { success: true, data: null };
      } catch (error: any) {
        if (error?.code === "storage/object-not-found") return { success: true, data: null };
        console.log("Error deleting the image: ", error);
        return { success: false, message: error.message };
      }
    },
    [],
  );

  return {
    getDownloadURL,
    deleteImage,
    getImagePreview,
    uploadImage,
    getPrivateImage,
  };
};

export default useStorage;
