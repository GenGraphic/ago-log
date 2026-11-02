import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { COL, db, RESEND_API_KEY } from './config.js';
import { remindersEmail, sendEmail } from './email.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function daysUntil(isoDate) {
  const target = new Date(isoDate);
  target.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Math.round((target - today) / 86_400_000);
}

function buildMessage(entry, days) {
  const isExpired = days < 0;
  const daysAbs = Math.abs(days);
  const plural = daysAbs !== 1 ? 's' : '';
  const typeLabel = String(entry.entryType ?? 'entry').replace(/_/g, ' ');

  const title = isExpired
    ? `${entry.title} has expired`
    : days === 0
      ? `${entry.title} expires today`
      : `${entry.title} expires in ${daysAbs} day${plural}`;

  const body = isExpired
    ? `Your ${typeLabel} expired ${daysAbs} day${plural} ago. Take action now.`
    : `Your ${typeLabel} is due soon. Don't let it lapse.`;

  return { title, body, type: isExpired ? 'expired' : 'warning' };
}

/**
 * Sends the messages to Expo and returns true if the token is no longer valid
 * (so it can be removed from the user profile).
 */
async function sendExpoPush(token, messages) {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(
      messages.map((m) => ({
        to: token,
        title: m.title,
        body: m.body,
        sound: 'default',
        channelId: 'default',
        data: { entryId: m.entryId },
      })),
    ),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    logger.error(`Expo push HTTP ${response.status}`, result);
    return false;
  }

  let tokenInvalid = false;
  for (const ticket of result?.data ?? []) {
    if (ticket.status === 'error') {
      logger.error('Expo push ticket error', ticket);
      if (ticket.details?.error === 'DeviceNotRegistered') tokenInvalid = true;
    }
  }
  return tokenInvalid;
}

/**
 * Daily job (replaces the Appwrite function send-notifications).
 * For every active entry with an expiry date, notifies the owner when
 * days left == notifyDaysBefore, on the expiry day and up to 3 days after.
 */
export const sendNotifications = onSchedule(
  {
    schedule: '0 7 * * *',
    timeZone: 'Europe/Bucharest',
    secrets: [RESEND_API_KEY],
    timeoutSeconds: 300,
  },
  async () => {
    const snap = await db
      .collection(COL.entries)
      .where('status', '==', 'Active')
      .where('expiryDate', '!=', null)
      .get();

    logger.info(`Checking ${snap.size} active entries with expiry dates`);

    const toNotify = new Map(); // userId → [{ entry, days }]
    for (const doc of snap.docs) {
      const entry = { id: doc.id, ...doc.data() };
      if (entry.notifyDaysBefore == null) continue;

      const days = daysUntil(entry.expiryDate);
      const shouldNotify = days === entry.notifyDaysBefore || days === 0 || (days < 0 && days >= -3);
      if (!shouldNotify) continue;

      if (!toNotify.has(entry.userId)) toNotify.set(entry.userId, []);
      toNotify.get(entry.userId).push({ entry, days });
    }

    logger.info(`${toNotify.size} users need notifications today`);

    for (const [userId, items] of toNotify) {
      const userRef = db.collection(COL.users).doc(userId);
      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        logger.warn(`User ${userId} not found, skipping`);
        continue;
      }
      const user = userSnap.data();

      const messages = items.map(({ entry, days }) => ({ ...buildMessage(entry, days), entryId: entry.id }));

      // 1. Push
      if (user.pushEnabled !== false && user.expoPushToken) {
        try {
          const tokenInvalid = await sendExpoPush(user.expoPushToken, messages);
          if (tokenInvalid) await userRef.update({ expoPushToken: null });
        } catch (err) {
          logger.error(`Push failed for ${userId}`, err);
        }
      }

      // 2. Email
      if (user.emailEnabled === true && user.email) {
        try {
          await sendEmail({
            to: user.email,
            subject: messages.length === 1 ? messages[0].title : `${messages.length} items need your attention`,
            html: remindersEmail(messages),
          });
        } catch (err) {
          logger.error(`Reminder email failed for ${userId}`, err);
        }
      }

      // 3. In-app notifications
      const batch = db.batch();
      const sentAt = new Date().toISOString();
      for (const m of messages) {
        batch.set(db.collection(COL.notifications).doc(), {
          userId,
          entryId: m.entryId,
          title: m.title,
          body: m.body,
          type: m.type,
          read: false,
          sentAt,
        });
      }
      await batch.commit();

      logger.info(`Notified ${userId} about ${messages.length} entries`);
    }
  },
);
