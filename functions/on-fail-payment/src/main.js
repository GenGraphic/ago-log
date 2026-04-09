import { Client, Databases, Messaging } from 'node-appwrite';

// ─── Constants ────────────────────────────────────────────────────────────────

const DB_ID           = process.env.APPWRITE_DB_ID;
const USERS_TABLE_ID  = process.env.APPWRITE_USERS_TABLE_ID;
const RC_WEBHOOK_AUTH = process.env.RC_WEBHOOK_AUTHORIZATION;

// RC events that represent a billing failure
const BILLING_FAIL_EVENTS = new Set([
  'BILLING_ISSUE',
  'EXPIRATION',
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

  const eventType  = event.type;
  const appUserId  = event.app_user_id;
  const productId  = event.product_id ?? '';

  log(`RC event: ${eventType} | user: ${appUserId} | product: ${productId}`);

  if (!appUserId) {
    return res.json({ ok: false, message: 'Missing app_user_id' }, 400);
  }

  if (!BILLING_FAIL_EVENTS.has(eventType)) {
    log(`Event ${eventType} not handled here — ignoring`);
    return res.json({ ok: true });
  }

  // ── Initialise Appwrite client ───────────────────────────────────────────
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const messaging = new Messaging(client);

  // ── Revert plan to Free ──────────────────────────────────────────────────
  try {
    await databases.updateDocument(DB_ID, USERS_TABLE_ID, appUserId, {
      plan: 'Free',
    });
    log(`Plan reverted to Free for user: ${appUserId} (reason: ${eventType})`);
  } catch (err) {
    error(`Failed to update plan for ${appUserId}: ${err.message}`);
    return res.json({ ok: false, message: 'DB update failed' }, 500);
  }

  // ── Send billing failure email ───────────────────────────────────────────
  try {
    await messaging.createEmail(
      'unique()',
      'Your Agolog Pro subscription has been paused',
      buildEmailBody(eventType),
      [],         // topics
      [appUserId],// targets
      [],         // CC
      [],         // BCC
      [],         // attachments
      false,      // draft
      true,       // html
    );
    log(`Billing failure email queued for user: ${appUserId}`);
  } catch (err) {
    // Non-critical — plan is already reverted, just log
    error(`Failed to send billing email for ${appUserId}: ${err.message}`);
  }

  return res.json({ ok: true });
};

// ─── Email body ───────────────────────────────────────────────────────────────

function buildEmailBody(eventType) {
  const isBillingIssue = eventType === 'BILLING_ISSUE';

  const headline = isBillingIssue
    ? 'We couldn\'t process your payment'
    : 'Your Pro subscription has expired';

  const body = isBillingIssue
    ? 'There was an issue charging your card. Your account has been moved back to the Free plan. Please update your payment method to restore Pro access.'
    : 'Your Agolog Pro subscription has expired and your account has been moved back to the Free plan. You can resubscribe anytime from the app.';

  const cta = isBillingIssue
    ? 'Update your payment method in the app under <strong style="color:#ECEDEE">Profile → Manage Subscription</strong>.'
    : 'Resubscribe anytime from the app under <strong style="color:#ECEDEE">Profile → Upgrade</strong>.';

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; background: #0D0D0D; color: #ECEDEE; margin: 0; padding: 0; }
      .container { max-width: 560px; margin: 40px auto; padding: 32px; background: #111; border-radius: 16px; }
      .logo { font-size: 18px; font-weight: 800; letter-spacing: 3px; color: #00F0FF; margin-bottom: 24px; }
      .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; background: rgba(255,96,96,0.15); color: #FF6060; font-size: 11px; font-weight: 800; letter-spacing: 1px; border: 1px solid rgba(255,96,96,0.3); margin-bottom: 24px; }
      h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; }
      p { font-size: 14px; color: #999; line-height: 1.6; margin: 0 0 16px; }
      .footer { margin-top: 32px; font-size: 11px; color: #333; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">AGOLOG</div>
      <div class="badge">ACTION REQUIRED</div>
      <h1>${headline}</h1>
      <p>${body}</p>
      <p>${cta}</p>
      <div class="footer">
        Questions? Contact our support team.<br/>
        © 2026 Agolog · <a href="#" style="color:#333">Privacy Policy</a>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

