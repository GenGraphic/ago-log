import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { setGlobalOptions } from 'firebase-functions/v2';
import { defineSecret, defineString } from 'firebase-functions/params';

export const REGION = 'europe-west1';

setGlobalOptions({ region: REGION, maxInstances: 10 });

initializeApp();

export const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
export const auth = getAuth();
export const storage = getStorage();

// ─── Secrets (firebase functions:secrets:set NAME) ────────────────────────────
export const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
export const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
export const RC_WEBHOOK_AUTHORIZATION = defineSecret('RC_WEBHOOK_AUTHORIZATION');

// ─── Plain params (asked on first deploy, stored in .env.<project>) ──────────
export const EMAIL_FROM = defineString('EMAIL_FROM', {
  description: 'Sender for transactional emails, e.g. "Ago Log <no-reply@gengraphic.de>"',
});

// ─── Collections / enums ──────────────────────────────────────────────────────
export const COL = {
  users: 'users',
  entries: 'entries',
  assets: 'assets',
  notifications: 'notifications',
  otpCodes: 'otpCodes',
};

export const PLAN = { FREE: 'FREE', PRO: 'PRO' };
export const USER_STATUS = { ACTIVE: 'Active', INACTIVE: 'Inactive', DELETED: 'Deleted' };
