import { Platform } from "react-native";

// ⚠️  Replace with your production key before shipping
export const RC_API_KEY =
  Platform.OS === "ios"
    ? "appl_mCyDyZAOrNxoGdJNdcLoAlCbCCb"
    : "goog_LpalnfFivjZVrdHYfWhOdPqXQZi"; // add separate Android key if needed

export const RC_ENTITLEMENT_ID = "GenGraphic Pro";

export const RC_OFFERING_ID = "default";

export const RC_PRODUCTS = {
  monthly: Platform.OS === "ios" ? "ago_pro_monthly" : "ago_pro_monthly:monthly",
  yearly: Platform.OS === "ios" ? "ago_pro_annually" : "ago_pro_annually:annually",
} as const;
