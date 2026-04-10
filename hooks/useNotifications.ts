import { useCallback, useState } from 'react';

import { db, DB_ID, NOTIFICATIONS_TABLE_ID, query } from '@/appwrite';
import { toNotification } from '@/helpers/userHelper';
import { Notification } from '@/models/types';
import { useAppSelector } from '@/store/hooks';


export function useNotifications() {
  const userId = useAppSelector((s) => s.user.id);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await db.listRows({
        databaseId: DB_ID,
        tableId: NOTIFICATIONS_TABLE_ID,
        queries: [
          query.equal('userId', userId),
          query.orderDesc('sentAt'),
          query.limit(100),
        ],
      });
      console.log(res)
      const items = res.rows.map(toNotification);
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.read).length);
    } catch (err: any) {
      console.log('fetchNotifications error:', err?.message ?? err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(
    async (id: string) => {
      await db.updateRow({
        databaseId: DB_ID,
        tableId: NOTIFICATIONS_TABLE_ID,
        rowId: id,
        data: { read: true },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) =>
        db.updateRow({
          databaseId: DB_ID,
          tableId: NOTIFICATIONS_TABLE_ID,
          rowId: n.id,
          data: { read: true },
        }),
      ),
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  return { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead };
}
