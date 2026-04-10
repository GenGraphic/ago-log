import { Notification } from '@/models/types';

export interface NotificationSection {
  title: string;
  data: Notification[];
}

function formatSentAt(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'TODAY';
  if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY';

  const diffDays = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays <= 7) return 'THIS WEEK';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

export function groupIntoSections(items: Notification[]): NotificationSection[] {
  const map = new Map<string, Notification[]>();
  for (const n of items) {
    const key = formatSentAt(n.sentAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}
