import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { COL, db, RESEND_API_KEY } from './config.js';
import { remindersEmail, sendEmail, simpleEmail } from './email.js';
import { expiryMessage, langOf, t } from './messages.js';
import { pushToUser } from './push.js';

// Keep reminding for a few days after the expiry date, except for
// warranties: once one has ended there is nothing left to do.
const DAYS_AFTER_EXPIRY = 3;
const NO_REMINDERS_AFTER_EXPIRY = new Set(['Warranty']);
// More reminders than this on the same day are pushed as one summary.
const MAX_SEPARATE_PUSHES = 2;

function daysUntil(isoDate) {
  const target = new Date(isoDate);
  target.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Math.round((target - today) / 86_400_000);
}

/**
 * Daily job. An entry with notifyDaysBefore = N is reminded every day during
 * the last N days before its expiry date, on the day itself and for
 * DAYS_AFTER_EXPIRY days after (warranties stop on the day itself).
 */
export const sendNotifications = onSchedule(
  {
    schedule: '0 7 * * *',
    timeZone: 'Europe/Bucharest',
    secrets: [RESEND_API_KEY],
    timeoutSeconds: 540,
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
      const daysAfter = NO_REMINDERS_AFTER_EXPIRY.has(entry.entryType) ? 0 : DAYS_AFTER_EXPIRY;
      if (days > entry.notifyDaysBefore || days < -daysAfter) continue;

      if (!toNotify.has(entry.userId)) toNotify.set(entry.userId, []);
      toNotify.get(entry.userId).push({ entry, days });
    }

    logger.info(`${toNotify.size} users need notifications today`);

    for (const [userId, items] of toNotify) {
      try {
        await notifyUser(userId, items);
      } catch (err) {
        logger.error(`Notifications failed for ${userId}`, err);
      }
    }
  },
);

async function notifyUser(userId, items) {
  const userRef = db.collection(COL.users).doc(userId);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    logger.warn(`User ${userId} not found, skipping`);
    return;
  }
  const user = userSnap.data();
  const lang = langOf(user);
  const s = t(lang);

  // Most urgent first
  items.sort((a, b) => a.days - b.days);
  const messages = items.map(({ entry, days }) => ({ ...expiryMessage(lang, entry, days), entryId: entry.id }));

  // 1. Push: one per entry, or a single summary when there are many
  const pushes =
    messages.length > MAX_SEPARATE_PUSHES
      ? [{ title: s.summaryTitle(messages.length), body: s.summaryBody(messages.map((m) => m.title)), data: { screen: 'notifications' } }]
      : messages.map((m) => ({ title: m.title, body: m.body, data: { entryId: m.entryId } }));
  try {
    await pushToUser(userRef, user, pushes);
  } catch (err) {
    logger.error(`Push failed for ${userId}`, err);
  }

  // 2. Email
  if (user.emailEnabled === true && user.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: messages.length === 1 ? messages[0].title : s.summaryTitle(messages.length),
        html: remindersEmail(messages, s),
      });
    } catch (err) {
      logger.error(`Reminder email failed for ${userId}`, err);
    }
  }

  // 3. In-app: one notification per entry, refreshed every day (and marked
  //    unread again) instead of piling up a new one each day.
  const batch = db.batch();
  const sentAt = new Date().toISOString();
  for (const m of messages) {
    batch.set(db.collection(COL.notifications).doc(`expiry_${m.entryId}`), {
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

/**
 * Sends a test push and email to the caller, so the user can check that
 * notifications reach them (Profile → Notifications).
 */
export const sendTestNotification = onCall({ secrets: [RESEND_API_KEY] }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'You must be signed in.');

  const userRef = db.collection(COL.users).doc(uid);
  const user = (await userRef.get()).data() ?? {};
  const s = t(langOf(user));

  let push = 'disabled';
  if (user.pushEnabled !== false) {
    if (!user.expoPushToken) push = 'no_token';
    else {
      try {
        push = (await pushToUser(userRef, user, [{ title: s.testTitle, body: s.testBody }])) ? 'sent' : 'invalid_token';
      } catch (err) {
        logger.error('Test push failed', err);
        push = 'failed';
      }
    }
  }

  let email = 'disabled';
  if (user.emailEnabled === true && user.email) {
    try {
      await sendEmail({ to: user.email, subject: s.testTitle, html: simpleEmail(s.testTitle, s.testEmailBody) });
      email = 'sent';
    } catch (err) {
      logger.error('Test email failed', err);
      email = 'failed';
    }
  }

  logger.info('Test notification', { uid, push, email });
  return { push, email };
});
