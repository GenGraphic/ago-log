import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

// Long edge in px. Enough for the AI to read small print, small enough
// to keep the upload and the base64 sent to extractEntryFromImage light.
const MAX_IMAGE_SIZE = 2000;

/**
 * Lets the user pick a photo from the library and returns a local JPEG uri,
 * or null if they cancel. Library photos can be HEIC/PNG, but the AI
 * function and Storage expect JPEG, so the image is always re-encoded.
 */
export async function pickImageFromLibrary(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_IMAGE_SIZE) {
    context.resize(
      asset.width >= asset.height
        ? { width: MAX_IMAGE_SIZE }
        : { height: MAX_IMAGE_SIZE },
    );
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
  return saved.uri;
}
