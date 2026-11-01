import { Client, ID, Permission, Query, Role, TablesDB } from 'node-appwrite';
import fetch from 'node-fetch';

// ─── Constants ────────────────────────────────────────────────────────────────

const ENDPOINT   = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const DB_ID      = process.env.APPWRITE_DB_ID;
const ENTRIES_TABLE_ID      = process.env.APPWRITE_ENTRIES_TABLE_ID;
const USERS_TABLE_ID        = process.env.APPWRITE_USERS_TABLE_ID;
const NOTIFICATIONS_TABLE_ID = process.env.APPWRITE_NOTIFICATIONS_TABLE_ID;

// Expo Push API endpoint
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(isoDate) {
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86_400_000);
}

async function sendExpoPush(tokens, title, body, log, error) {
  if (!tokens.length) return;
  const messages = tokens.map((to) => ({
    to,
    title,
    body,
    sound: 'default',
    channelId: 'default',
  }));
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      error(`Expo push HTTP ${response.status}: ${JSON.stringify(result)}`);
      return;
    }
    // Expo returns one ticket per message; failures (e.g. DeviceNotRegistered,
    // InvalidCredentials when FCM keys are missing) are only visible here.
    for (const ticket of result?.data ?? []) {
      if (ticket.status === 'error') {
        error(`Expo push ticket error: ${ticket.message} ${JSON.stringify(ticket.details ?? {})}`);
      } else {
        log(`Expo push ticket ok: ${ticket.id}`);
      }
    }
  } catch (err) {
    error('Expo push request failed: ' + err.message);
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const db = new TablesDB(client);

  const missingEnv = Object.entries({
    APPWRITE_DB_ID: DB_ID,
    APPWRITE_ENTRIES_TABLE_ID: ENTRIES_TABLE_ID,
    APPWRITE_USERS_TABLE_ID: USERS_TABLE_ID,
    APPWRITE_NOTIFICATIONS_TABLE_ID: NOTIFICATIONS_TABLE_ID,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missingEnv.length) {
    error(`Missing environment variables: ${missingEnv.join(', ')}`);
    return res.json({ ok: false, message: `Missing env: ${missingEnv.join(', ')}` }, 500);
  }

  try {
    // 1. Fetch all active entries that have an expiryDate and notifyDaysBefore set
    const entriesRes = await db.listRows({
      databaseId: DB_ID, 
      tableId: ENTRIES_TABLE_ID, 
      queries: [
        Query.equal('status', 'Active'),
        Query.isNotNull('expiryDate'),
        Query.isNotNull('notifyDaysBefore'),
        Query.limit(500),
      ]
    });

    log(`Checking ${entriesRes.total} active entries with expiry dates`);

    // Group entries that need a notification today by userId
    const toNotify = {}; // { userId: [{ entry, days }] }

    for (const entry of entriesRes.rows) {
      const days = daysUntil(entry.expiryDate);

      // Fire when days remaining equals notifyDaysBefore, or on expiry day (0), or when expired (-1 to -3 grace)
      const shouldNotify =
        days === entry.notifyDaysBefore ||
        days === 0 ||
        (days < 0 && days >= -3);

      if (!shouldNotify) continue;

      if (!toNotify[entry.userId]) toNotify[entry.userId] = [];
      toNotify[entry.userId].push({ entry, days });
    }

    const userIds = Object.keys(toNotify);
    log(`${userIds.length} users need notifications today`);

    for (const userId of userIds) {
      // 2. Fetch user preferences
      let user;
      try {
        user = await db.getRow({
          databaseId: DB_ID, 
          tableId: USERS_TABLE_ID, 
          rowId: userId
        });
      } catch {
        error(`User ${userId} not found, skipping`);
        continue;
      }

      const pushEnabled  = user.pushEnabled  !== false; // default true
      const emailEnabled = user.emailEnabled === true;
      const pushToken    = user.expoPushToken ?? null;
      const userEmail    = user.email;

      const pushTokens = pushEnabled && pushToken ? [pushToken] : [];

      for (const { entry, days } of toNotify[userId]) {
        const isExpired = days < 0;
        const type      = isExpired ? 'expired' : 'warning';
        const daysAbs   = Math.abs(days);

        const title = isExpired
          ? `${entry.title} has expired`
          : days === 0
            ? `${entry.title} expires today`
            : `${entry.title} expires in ${daysAbs} day${daysAbs !== 1 ? 's' : ''}`;

        const body = isExpired
          ? `Your ${entry.entryType.replace(/_/g, ' ')} expired ${daysAbs} day${daysAbs !== 1 ? 's' : ''} ago. Take action now.`
          : `Your ${entry.entryType.replace(/_/g, ' ')} is due soon. Don't let it lapse.`;

        // 3. Push
        if (pushTokens.length) {
          await sendExpoPush(pushTokens, title, body, log, error);
        }

        // 4. Email via Appwrite Messaging (basic — requires email provider configured)
        if (emailEnabled && userEmail) {
          // Appwrite Messaging email requires a provider set up in the console.
          // This is a no-op stub until the provider is configured.
          log(`Email queued for ${userEmail}: ${title}`);
        }

        // 5. Write notification record to DB
        await db.createRow({
          databaseId: DB_ID, 
          tableId: NOTIFICATIONS_TABLE_ID, 
          rowId: ID.unique(),
          data: {
            userId,
            entryId: entry.$id,
            title,
            body,
            type,
            read: false,
            sentAt: new Date().toISOString(),
          },
          permissions: [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId))
          ]
        });

        log(`Notified user ${userId} about "${entry.title}" (${days} days)`);
      }
    }

    return res.json({ ok: true, processed: userIds.length });
  } catch (err) {
    error('send-notifications failed: ' + err.message);
    return res.json({ ok: false, message: err.message }, 500);
  }
};

