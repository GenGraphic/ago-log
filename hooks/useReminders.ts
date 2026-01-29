import { useEffect, useState } from 'react';
import * as remindersLib from '../lib/db/reminders';
import { ReminderModel } from '../types/reminder';

export default function useReminders(userId?: string) {
  const [items, setItems] = useState<ReminderModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (async () => {
      try {
        const res: any = await remindersLib.listUpcomingForUser(userId);
        setItems(res.documents || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const create = async (payload: Partial<ReminderModel>) => {
    return await remindersLib.createReminder(payload);
  };

  return { items, loading, error, create };
}
