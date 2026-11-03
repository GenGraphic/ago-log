import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

// Long edge in px. Enough for the AI to read small print, small enough
// to keep the upload and the base64 sent to extractEntryFromImage light.
const MAX_IMAGE_SIZE = 2000;

/**
 * Re-encodes a photo as JPEG and scales it down to MAX_IMAGE_SIZE on the
 * long edge. Library photos can be HEIC/PNG and camera photos are full
 * resolution, but the AI function and Storage expect a reasonably sized JPEG.
 */
export async function prepareImage(
  uri: string,
  width: number,
  height: number,
): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > MAX_IMAGE_SIZE) {
    context.resize(
      width >= height ? { width: MAX_IMAGE_SIZE } : { height: MAX_IMAGE_SIZE },
    );
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
  return saved.uri;
}

/**
 * Lets the user pick a photo from the library and returns a prepared JPEG
 * uri, or null if they cancel.
 */
export async function pickImageFromLibrary(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  return prepareImage(asset.uri, asset.width, asset.height);
}

/**
 * Opens the system camera and returns a prepared JPEG uri, or null if the
 * user cancels or denies the permission.
 */
export async function takePhotoWithCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 1,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  return prepareImage(asset.uri, asset.width, asset.height);
}
