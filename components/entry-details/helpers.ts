import { StatusColors } from "@/constants/Colors";
import { EntryStatus } from "@/models/enums";
import { Entry } from "@/models/types";

export function formatDate(iso?: string): string {
  if (!iso) return "---";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return iso;
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function statusColor(entry: Entry): string {
  switch (entry.status) {
    case EntryStatus.EXPIRED:
      return StatusColors.expired;
    case EntryStatus.ARCHIVED:
      return StatusColors.archived;
    default:
      return StatusColors.active;
  }
}
