import { Currency, EntryStatus, EntryType, NotifType, UserPlan, UserStatus } from "./enums";

export type HookResponse<T = void> =
  | { success: true;  data: T }
  | { success: false; message: string };

export interface User_DB {
    name?: string;
    email: string;
    avatar?: string;
    status: UserStatus;
    plan: UserPlan;
    phone?: string;
    pushEnabled: boolean;
    emailEnabled: boolean;
    expoPushToken: string | null;
}
export interface User extends User_DB {
    id: string;
    createdAt: string;
}

export interface Entry_DB {
  userId: string;        // owner — matches the Appwrite auth user $id
  title: string;         // user-facing name, e.g. "My Passport", "Netflix"
  entryType: EntryType;  // drives which fields are shown in the form (see ENTRY_CONFIG)
  status: EntryStatus;   // Active | Archived | Expired

  assetId?: string;      // optional link to an Asset

  notes?: string;        // free-text field shown on all types

  // ─── Expiry / renewal ────────────────────────────────────────────────────
  expiryDate?: string;         // ISO date — expiry, renewal, due, or birth date depending on type
  notifyDaysBefore?: number;   // days before expiryDate to send a push notification

  // ─── Origin info ─────────────────────────────────────────────────────────
  issuer?: string;      // who issued it — "Allianz", "DVLA", "Apple", "Netflix"
  identifier?: string;  // unique reference — policy #, passport #, doc number, serial

  // ─── Credentials (EntryType.CREDENTIAL only) ─────────────────────────────
  secret?: string;    // password or PIN — must be encrypted client-side before storing
  username?: string;  // login email or username for the account
  url?: string;       // website or app URL, e.g. "https://netflix.com"

  // ─── Maintenance / Vehicle ────────────────────────────────────────────────
  lastServiceDate?: string;  // ISO date — when the task was last completed
  intervalDays?: number;     // time-based recurrence, e.g. 180 = every 6 months
  lastMileage?: number;      // odometer reading when last serviced (km or miles)
  mileageInterval?: number;  // mileage-based recurrence, e.g. 10000 km

  // ─── Attachments ─────────────────────────────────────────────────────────
  // The photo of the physical document. Used for AI extraction on add,
  // then stored permanently so the user can view the original image anytime.
  imageId?: string;  // Appwrite Storage file ID

  currentPrice?: number;
  currency?: Currency
}

export interface Entry extends Entry_DB {
  id: string;
  createdAt: string;
  updatedAt: string;
  assetId?: string;
}

export interface Notification_DB {
  userId: string;
  entryId?: string;
  title: string;
  body: string;
  type: NotifType;
  read: boolean;
  sentAt: string;
}

export interface Notification extends Notification_DB {
  id: string;
}

export interface EntryAIPrefill {
  // Core
  title?: string;
  entryType?: EntryType;
  notes?: string;

  // Expiry / renewal
  expiryDate?: string;

  // Origin
  issuer?: string;
  identifier?: string;

  // Credentials
  username?: string;
  url?: string;

  // Maintenance / Vehicle
  lastServiceDate?: string;
  lastMileage?: number;
  mileageInterval?: number;
}

