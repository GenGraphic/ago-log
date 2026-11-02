import { useCallback, useState } from 'react';

import { COLLECTIONS, db } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
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
      const snap = await getDocs(
        query(
          collection(db, COLLECTIONS.notifications),
          where('userId', '==', userId),
          orderBy('sentAt', 'desc'),
          limit(100),
        ),
      );
      const items = snap.docs.map(toNotification);
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
      await updateDoc(doc(db, COLLECTIONS.notifications, id), { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    // A batch holds max 500 writes
    for (let i = 0; i < unread.length; i += 500) {
      const batch = writeBatch(db);
      unread
        .slice(i, i + 500)
        .forEach((n) => batch.update(doc(db, COLLECTIONS.notifications, n.id), { read: true }));
      await batch.commit();
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  return { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead };
}
