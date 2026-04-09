import { Client, Databases, Messaging } from 'node-appwrite';

// ─── Constants ────────────────────────────────────────────────────────────────

const DB_ID            = process.env.APPWRITE_DB_ID;
const USERS_TABLE_ID   = process.env.APPWRITE_USERS_TABLE_ID;
const RC_WEBHOOK_AUTH  = process.env.RC_WEBHOOK_AUTHORIZATION; // RevenueCat webhook auth header value

// RevenueCat event types that mean a successful purchase or renewal
const SUCCESS_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
]);

// RevenueCat event types that mean access was lost
const REVOKE_EVENTS = new Set([
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
  'REFUND',
]);

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  // ── Verify RevenueCat webhook authorization header ───────────────────────
  const authHeader = req.headers['authorization'] ?? '';
  if (RC_WEBHOOK_AUTH && authHeader !== RC_WEBHOOK_AUTH) {
    error('Unauthorized webhook request');
    return res.json({ ok: false, message: 'Unauthorized' }, 401);
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    error('Failed to parse request body');
    return res.json({ ok: false, message: 'Invalid JSON' }, 400);
  }

  const event = body?.event;
  if (!event) {
    return res.json({ ok: false, message: 'No event in payload' }, 400);
  }

  const eventType   = event.type;
  const appUserId   = event.app_user_id;   // this is the Appwrite user ID we passed to RC.logIn()
  const productId   = event.product_id ?? '';
  const periodType  = event.period_type ?? '';

  log(`RC event: ${eventType} | user: ${appUserId} | product: ${productId}`);

  if (!appUserId) {
    return res.json({ ok: false, message: 'Missing app_user_id' }, 400);
  }

  // ── Initialise Appwrite client ───────────────────────────────────────────
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases  = new Databases(client);
  const messaging  = new Messaging(client);

  // ── Handle event ─────────────────────────────────────────────────────────
  if (SUCCESS_EVENTS.has(eventType)) {
    await handleUpgrade({ databases, messaging, appUserId, productId, periodType, eventType, log, error });
  } else if (REVOKE_EVENTS.has(eventType)) {
    await handleDowngrade({ databases, appUserId, eventType, log, error });
  } else {
    log(`Unhandled event type: ${eventType} — ignoring`);
  }

  return res.json({ ok: true });
};

// ─── Upgrade user to Pro ──────────────────────────────────────────────────────

async function handleUpgrade({ databases, messaging, appUserId, productId, periodType, eventType, log, error }) {
  try {
    // Update user plan in DB
    await databases.updateDocument(DB_ID, USERS_TABLE_ID, appUserId, {
      plan: 'Pro',
    });
    log(`Plan updated to Pro for user: ${appUserId}`);

    // Send thank-you email only on initial purchase (not renewals)
    if (eventType === 'INITIAL_PURCHASE') {
      await sendThankYouEmail({ messaging, appUserId, productId, log, error });
    }
  } catch (err) {
    error(`Failed to upgrade user ${appUserId}: ${err.message}`);
  }
}

// ─── Downgrade user to Free ───────────────────────────────────────────────────

async function handleDowngrade({ databases, appUserId, eventType, log, error }) {
  try {
    await databases.updateDocument(DB_ID, USERS_TABLE_ID, appUserId, {
      plan: 'Free',
    });
    log(`Plan reverted to Free for user: ${appUserId} (reason: ${eventType})`);
  } catch (err) {
    error(`Failed to downgrade user ${appUserId}: ${err.message}`);
  }
}

// ─── Thank-you email ──────────────────────────────────────────────────────────

async function sendThankYouEmail({ messaging, appUserId, productId, log, error }) {
  const isAnnual = productId.includes('annual') || productId.includes('yearly') || productId.includes('annually');
  const planLabel = isAnnual ? 'Annual Pro' : 'Monthly Pro';

  try {
    await messaging.createEmail(
      'unique()',                         // message ID
      `Welcome to Agolog ${planLabel}!`,  // subject
      buildEmailBody(planLabel),          // HTML body
      [],                                 // topics
      [appUserId],                        // target user IDs
      [],                                 // CC
      [],                                 // BCC
      [],                                 // attachments
      false,                              // draft
      true,                               // html
    );
    log(`Thank-you email queued for user: ${appUserId}`);
  } catch (err) {
    // Non-critical — log but don't fail the webhook
    error(`Failed to send thank-you email for ${appUserId}: ${err.message}`);
  }
}

function buildEmailBody(planLabel) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; background: #0D0D0D; color: #ECEDEE; margin: 0; padding: 0; }
      .container { max-width: 560px; margin: 40px auto; padding: 32px; background: #111; border-radius: 16px; }
      .logo { font-size: 18px; font-weight: 800; letter-spacing: 3px; color: #00F0FF; margin-bottom: 24px; }
      h1 { font-size: 24px; font-weight: 800; margin: 0 0 12px; }
      p { font-size: 14px; color: #999; line-height: 1.6; margin: 0 0 16px; }
      .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; background: #00F0FF; color: #0D0D0D; font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 24px; }
      .footer { margin-top: 32px; font-size: 11px; color: #333; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">AGOLOG</div>
      <div class="badge">${planLabel.toUpperCase()}</div>
      <h1>You're all set.</h1>
      <p>Thanks for upgrading to <strong style="color:#ECEDEE">${planLabel}</strong>. Your account is now unlocked — log as much as you want, with no limits.</p>
      <p>Head back to the app to start logging.</p>
      <div class="footer">
        If you didn't make this purchase, please contact support.<br/>
        © 2026 Agolog · <a href="#" style="color:#333">Privacy Policy</a>
      </div>
    </div>
  </body>
</html>
  `.trim();
}
