import i18n from "./index";
import { TranslationKeys } from "./types";

export function t(key: TranslationKeys, options?: any): string {
  return i18n.t(key, { ...options, returnObjects: false }) as string;
}