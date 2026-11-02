import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  limit as fsLimit,
  orderBy,
  QueryConstraint,
  where,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Values come from the Firebase console → Project settings → Your apps (Web app).
// They are public identifiers, not secrets; override them with EXPO_PUBLIC_* env vars.
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyCROrqY_ZBDBgsNPPQQF2IifJkH6Di7Z5k",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "ago-log.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "ago-log",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "ago-log.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "980575056524",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    "1:980575056524:android:87c21bfd0e3b20000741a9",
};

export const FUNCTIONS_REGION = "europe-west1";

const isFirstInit = getApps().length === 0;
export const firebaseApp = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// getReactNativePersistence only exists in the React Native build of
// firebase/auth, so it is missing from the default type definitions.
const getReactNativePersistence = (FirebaseAuth as any)
  .getReactNativePersistence as (storage: unknown) => FirebaseAuth.Persistence;

export const auth = isFirstInit
  ? FirebaseAuth.initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : FirebaseAuth.getAuth(firebaseApp);

export const db = isFirstInit
  ? initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true })
  : getFirestore(firebaseApp);

export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp, FUNCTIONS_REGION);

// Collections
export const COLLECTIONS = {
  users: "users",
  entries: "entries",
  assets: "assets",
  notifications: "notifications",
} as const;

// Folder for entry photos: users/{uid}/entries/{fileId}.jpg
export const ENTRIES_IMAGES_FOLDER = "entries";

/** Returns the signed-in user's uid or throws. */
export function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You are not signed in.");
  return uid;
}

/**
 * Small query helper with the same shape as the old Appwrite `Query`,
 * so components can keep building filters like query.equal("status", ...).
 */
export const query = {
  equal: (field: string, value: unknown): QueryConstraint =>
    Array.isArray(value) ? where(field, "in", value) : where(field, "==", value),
  notEqual: (field: string, value: unknown): QueryConstraint =>
    where(field, "!=", value),
  isNotNull: (field: string): QueryConstraint => where(field, "!=", null),
  greaterThan: (field: string, value: unknown): QueryConstraint =>
    where(field, ">", value),
  greaterThanEqual: (field: string, value: unknown): QueryConstraint =>
    where(field, ">=", value),
  lessThan: (field: string, value: unknown): QueryConstraint =>
    where(field, "<", value),
  lessThanEqual: (field: string, value: unknown): QueryConstraint =>
    where(field, "<=", value),
  orderAsc: (field: string): QueryConstraint => orderBy(field, "asc"),
  orderDesc: (field: string): QueryConstraint => orderBy(field, "desc"),
  limit: (n: number): QueryConstraint => fsLimit(n),
};
