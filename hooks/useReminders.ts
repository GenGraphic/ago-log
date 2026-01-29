import { useEffect, useState } from 'react';
import { auth } from '../appwrite';
import * as remindersLib from '../lib/db/reminders';
import { ReminderModel } from '../types/reminder';

export default function useReminders() {
  const [items, setItems] = useState<ReminderModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const user = await auth.get();
        const res: any = await remindersLib.listUpcomingForUser(user.$id);
        if (!mounted) return;
        setItems(res.documents || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message || 'Failed to load');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const create = async (payload: Partial<ReminderModel>) => {
    const doc: any = await remindersLib.createReminder(payload);
    setItems((s) => [doc, ...s]);
    return doc;
  };

  return { items, loading, error, create };
}
