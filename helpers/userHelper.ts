import { Asset } from "@/models/assets";
import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { AssetType, EntryStatus, EntryType, UserPlan, UserStatus } from "../models/enums";
import { Entry, Notification, User } from "../models/types";

type Doc = Pick<DocumentSnapshot<DocumentData>, "id" | "data">;

const nn = <T>(v: T | null | undefined): T | undefined => v ?? undefined;

export const toUser = (doc: Doc): User => {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    createdAt: d.createdAt,
    name: d.name ?? undefined,
    email: d.email,
    avatar: d.avatar ?? undefined,
    status: d.status as UserStatus,
    plan: (d.plan as UserPlan) ?? UserPlan.FREE,
    phone: d.phone ?? undefined,
    emailEnabled: d.emailEnabled ?? false,
    expoPushToken: d.expoPushToken ?? null,
    pushEnabled: d.pushEnabled ?? true,
    setupGoals: d.setupGoals ?? [],
    setupCompletedAt: d.setupCompletedAt ?? undefined,
    checklistDismissed: d.checklistDismissed ?? false,
  };
};

export const toEntry = (doc: Doc): Entry => {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt ?? d.createdAt,
    userId: d.userId,
    title: d.title,
    entryType: d.entryType as EntryType,
    status: d.status as EntryStatus,
    notes: nn(d.notes),
    expiryDate: nn(d.expiryDate),
    notifyDaysBefore: nn(d.notifyDaysBefore),
    issuer: nn(d.issuer),
    identifier: nn(d.identifier),
    secret: nn(d.secret),
    username: nn(d.username),
    url: nn(d.url),
    lastServiceDate: nn(d.lastServiceDate),
    intervalDays: nn(d.intervalDays),
    lastMileage: nn(d.lastMileage),
    mileageInterval: nn(d.mileageInterval),
    imageId: nn(d.imageId),
    currency: nn(d.currency),
    currentPrice: nn(d.currentPrice),
  };
};

export function toNotification(doc: Doc): Notification {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    userId: d.userId,
    entryId: d.entryId,
    title: d.title,
    body: d.body,
    type: d.type,
    read: d.read,
    sentAt: d.sentAt,
    sources: d.sources ?? undefined,
  };
}

/**
 * In Firestore an asset stores the linked entry ids in `entries: string[]`.
 * Pass `resolvedEntries` to replace the ids with the full Entry objects.
 */
export function toAsset(doc: Doc, resolvedEntries?: Entry[]): Asset {
  const d = doc.data() ?? {};
  const entryIds: string[] = Array.isArray(d.entries) ? d.entries : [];

  return {
    id: doc.id,
    createdAt: d.createdAt,
    userId: d.userId,
    name: d.name,
    type: d.type as AssetType,
    description: nn(d.description),
    brand: nn(d.brand),
    model: nn(d.model),
    year: nn(d.year),
    vin: nn(d.vin),
    registrationNumber: nn(d.registrationNumber),
    address: nn(d.address),
    rooms: nn(d.rooms),
    surface: nn(d.surface),
    priceEvaluation: nn(d.priceEvaluation),
    constructionYear: nn(d.constructionYear),
    businessName: nn(d.businessName),
    activityType: nn(d.activityType),
    foundedYear: nn(d.foundedYear),
    notes: nn(d.notes),
    entries: resolvedEntries ?? entryIds,
  };
}

/** Normalizes date fields to ISO strings so string comparisons in queries work. */
export function normalizeDates<T extends Record<string, any>>(
  data: T,
  fields: string[] = ["expiryDate", "lastServiceDate"],
): T {
  const out: Record<string, any> = { ...data };
  for (const f of fields) {
    if (out[f]) {
      const d = new Date(out[f]);
      if (!isNaN(d.getTime())) out[f] = d.toISOString();
    }
  }
  return out as T;
}
