import { Asset } from "@/models/assets";
import { Models } from "react-native-appwrite";
import { AssetType, EntryStatus, EntryType, UserPlan, UserStatus } from "../models/enums";
import { Entry, Notification, User } from "../models/types";

export const toUser = (dbUser: Models.DefaultRow): User => {
  return {
    id: dbUser.$id,
    createdAt: dbUser.$createdAt,
    name: dbUser.name,
    email: dbUser.email,
    avatar: dbUser.avatar,
    status: dbUser.status as UserStatus,
    plan: (dbUser.plan as UserPlan) ?? UserPlan.FREE,
    phone: dbUser.phone,
    emailEnabled: dbUser.emailEnabled,
    expoPushToken: dbUser.expoPushToken,
    pushEnabled: dbUser.pushEnabled
  };
};

export const toEntry = (dbEntry: Models.DefaultRow): Entry => ({
  id: dbEntry.$id,
  createdAt: dbEntry.$createdAt,
  updatedAt: dbEntry.$updatedAt,
  userId: dbEntry.userId,
  title: dbEntry.title,
  entryType: dbEntry.entryType as EntryType,
  status: dbEntry.status as EntryStatus,
  notes: dbEntry.notes ?? undefined,
  expiryDate: dbEntry.expiryDate ?? undefined,
  notifyDaysBefore: dbEntry.notifyDaysBefore ?? undefined,
  issuer: dbEntry.issuer ?? undefined,
  identifier: dbEntry.identifier ?? undefined,
  secret: dbEntry.secret ?? undefined,
  username: dbEntry.username ?? undefined,
  url: dbEntry.url ?? undefined,
  lastServiceDate: dbEntry.lastServiceDate ?? undefined,
  intervalDays: dbEntry.intervalDays ?? undefined,
  lastMileage: dbEntry.lastMileage ?? undefined,
  mileageInterval: dbEntry.mileageInterval ?? undefined,
  imageId: dbEntry.imageId ?? undefined,
  currency: dbEntry.currency ?? undefined,
  currentPrice: dbEntry.currentPrice ?? undefined,
});

export function toNotification(doc: Models.DefaultRow): Notification {
  return {
    id: doc.$id,
    userId: doc.userId,
    entryId: doc.entryId,
    title: doc.title,
    body: doc.body,
    type: doc.type,
    read: doc.read,
    sentAt: doc.sentAt,
  };
}

export function toAsset(doc: Models.DefaultRow): Asset {
  const entries = Array.isArray(doc.entries)
    ? doc.entries
        .map((entry: any) =>
          typeof entry === "string" ? entry : toEntry(entry as Models.DefaultRow),
        )
        .filter(Boolean)
    : undefined;

  return {
    id: doc.$id,
    createdAt: doc.$createdAt,
    userId: doc.userId,
    name: doc.name,
    type: doc.type as AssetType,
    description: doc.description ?? undefined,
    brand: doc.brand ?? undefined,
    model: doc.model ?? undefined,
    year: doc.year ?? undefined,
    vin: doc.vin ?? undefined,
    registrationNumber: doc.registrationNumber ?? undefined,
    address: doc.address ?? undefined,
    rooms: doc.rooms ?? undefined,
    surface: doc.surface ?? undefined,
    priceEvaluation: doc.priceEvaluation ?? undefined,
    constructionYear: doc.constructionYear ?? undefined,
    businessName: doc.businessName ?? undefined,
    activityType: doc.activityType ?? undefined,
    foundedYear: doc.foundedYear ?? undefined,
    notes: doc.notes ?? undefined,
    entries,
  };
}