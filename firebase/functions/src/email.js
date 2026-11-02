import { logger } from 'firebase-functions';
import { EMAIL_FROM, RESEND_API_KEY } from './config.js';

const RESEND_URL = 'https://api.resend.com/emails';

/**
 * Sends a transactional email through Resend (https://resend.com, free tier
 * 3k emails/month). Functions that call this must list RESEND_API_KEY in
 * their `secrets` option.
 */
export async function sendEmail({ to, subject, html }) {
  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY.value()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: EMAIL_FROM.value(), to: [to], subject, html }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    logger.error('Resend error', { status: response.status, body: text });
    throw new Error(`Email sending failed (${response.status})`);
  }
}

const BASE_STYLE = `
  body { font-family: Arial, sans-serif; background: #0D0D0D; color: #ECEDEE; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; padding: 32px; background: #111; border-radius: 16px; }
  .logo { font-size: 18px; font-weight: 800; letter-spacing: 3px; color: #00F0FF; margin-bottom: 24px; }
  h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; }
  p { font-size: 14px; color: #999; line-height: 1.6; margin: 0 0 16px; }
  .code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ECEDEE; margin: 24px 0; }
  .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 24px; }
  .badge-ok { background: #00F0FF; color: #0D0D0D; }
  .badge-warn { background: rgba(255,96,96,0.15); color: #FF6060; border: 1px solid rgba(255,96,96,0.3); }
  ul { padding-left: 18px; color: #ECEDEE; font-size: 14px; line-height: 1.8; }
  .footer { margin-top: 32px; font-size: 11px; color: #555; }
`;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function layout(inner) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><style>${BASE_STYLE}</style></head>
  <body>
    <div class="container">
      <div class="logo">AGOLOG</div>
      ${inner}
      <div class="footer">© ${new Date().getFullYear()} Agolog</div>
    </div>
  </body>
</html>`;
}

export function otpEmail(code) {
  return layout(`
    <h1>Your login code</h1>
    <p>Enter this code in the app to sign in. It expires in 10 minutes.</p>
    <div class="code">${code}</div>
    <p>If you didn't request this code, you can ignore this email.</p>
  `);
}

export function thankYouEmail(planLabel) {
  return layout(`
    <div class="badge badge-ok">${escapeHtml(planLabel.toUpperCase())}</div>
    <h1>You're all set.</h1>
    <p>Thanks for upgrading to <strong style="color:#ECEDEE">${escapeHtml(planLabel)}</strong>. Your account is now unlocked — log as much as you want, with no limits.</p>
    <p>Head back to the app to start logging.</p>
    <p style="font-size:11px">If you didn't make this purchase, please contact support.</p>
  `);
}

export function billingProblemEmail(eventType) {
  const isBillingIssue = eventType === 'BILLING_ISSUE';
  const headline = isBillingIssue ? "We couldn't process your payment" : 'Your Pro subscription has expired';
  const body = isBillingIssue
    ? 'There was an issue charging your card. Your account has been moved back to the Free plan. Please update your payment method to restore Pro access.'
    : 'Your Agolog Pro subscription has expired and your account has been moved back to the Free plan. You can resubscribe anytime from the app.';
  const cta = isBillingIssue
    ? 'Update your payment method in the app under <strong style="color:#ECEDEE">Profile → Manage Subscription</strong>.'
    : 'Resubscribe anytime from the app under <strong style="color:#ECEDEE">Profile → Upgrade</strong>.';

  return layout(`
    <div class="badge badge-warn">ACTION REQUIRED</div>
    <h1>${headline}</h1>
    <p>${body}</p>
    <p>${cta}</p>
  `);
}

export function remindersEmail(items) {
  const list = items.map((i) => `<li><strong>${escapeHtml(i.title)}</strong><br/><span style="color:#999">${escapeHtml(i.body)}</span></li>`).join('');
  return layout(`
    <h1>Upcoming expirations</h1>
    <ul>${list}</ul>
    <p>Open the app to see the details.</p>
  `);
}
