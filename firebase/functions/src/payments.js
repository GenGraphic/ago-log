import { timingSafeEqual } from 'node:crypto';
import { logger } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';

import { COL, db, PLAN, RC_WEBHOOK_AUTHORIZATION, RESEND_API_KEY } from './config.js';
import { billingProblemEmail, sendEmail, thankYouEmail } from './email.js';

// Purchase / renewal → PRO
const UPGRADE_EVENTS = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION']);

// Access lost → FREE.
// CANCELLATION is intentionally NOT here: in RevenueCat it only means
// auto-renew was turned off; the user keeps access until EXPIRATION.
const DOWNGRADE_EVENTS = new Set(['EXPIRATION', 'BILLING_ISSUE', 'REFUND']);

// Events that send the "action required" email
const BILLING_EMAIL_EVENTS = new Set(['EXPIRATION', 'BILLING_ISSUE']);

function isAuthorized(header) {
  const expected = Buffer.from(RC_WEBHOOK_AUTHORIZATION.value());
  const actual = Buffer.from(String(header ?? ''));
  return expected.length > 0 && expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * Single RevenueCat webhook (replaces on-success-payment + on-fail-payment).
 * Set its URL in RevenueCat → Integrations → Webhooks, with the
 * Authorization header equal to the RC_WEBHOOK_AUTHORIZATION secret.
 */
export const revenuecatWebhook = onRequest(
  { secrets: [RC_WEBHOOK_AUTHORIZATION, RESEND_API_KEY], invoker: 'public' },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false });
      return;
    }
    if (!isAuthorized(req.headers.authorization)) {
      logger.warn('Unauthorized webhook request');
      res.status(401).json({ ok: false, message: 'Unauthorized' });
      return;
    }

    const event = req.body?.event;
    if (!event) {
      res.status(400).json({ ok: false, message: 'No event in payload' });
      return;
    }

    const { type: eventType, app_user_id: appUserId } = event;
    const productId = event.product_id ?? '';
    logger.info('RC event', { eventType, appUserId, productId });

    if (!appUserId) {
      res.status(400).json({ ok: false, message: 'Missing app_user_id' });
      return;
    }

    let newPlan = null;
    if (UPGRADE_EVENTS.has(eventType)) newPlan = PLAN.PRO;
    else if (DOWNGRADE_EVENTS.has(eventType)) newPlan = PLAN.FREE;

    if (!newPlan) {
      logger.info(`Unhandled event type ${eventType} — ignoring`);
      res.json({ ok: true });
      return;
    }

    const userRef = db.collection(COL.users).doc(appUserId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      // Anonymous RC ids ($RCAnonymousID:...) or deleted users — nothing to update.
      logger.warn(`User ${appUserId} not found`);
      res.json({ ok: true });
      return;
    }

    try {
      await userRef.update({ plan: newPlan });
      logger.info(`Plan set to ${newPlan} for ${appUserId} (${eventType})`);
    } catch (err) {
      logger.error(`Failed to update plan for ${appUserId}`, err);
      res.status(500).json({ ok: false, message: 'DB update failed' });
      return;
    }

    // Emails are non-critical
    const email = userSnap.get('email');
    if (email) {
      try {
        if (eventType === 'INITIAL_PURCHASE') {
          const isAnnual = /annual|yearly/i.test(productId);
          const planLabel = isAnnual ? 'Annual Pro' : 'Monthly Pro';
          await sendEmail({ to: email, subject: `Welcome to Agolog ${planLabel}!`, html: thankYouEmail(planLabel) });
        } else if (BILLING_EMAIL_EVENTS.has(eventType)) {
          await sendEmail({
            to: email,
            subject: 'Your Agolog Pro subscription has been paused',
            html: billingProblemEmail(eventType),
          });
        }
      } catch (err) {
        logger.error(`Email failed for ${appUserId}`, err);
      }
    }

    res.json({ ok: true });
  },
);
