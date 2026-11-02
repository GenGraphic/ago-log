import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { auth, COL, db, PLAN, RESEND_API_KEY, USER_STATUS } from './config.js';
import { otpEmail, sendEmail } from './email.js';

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds between emails
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();
const otpDocId = (email) => sha256(email);

/**
 * Step 1 of login: generate a 6-digit code, store its hash and email it.
 * Input: { email }
 */
export const sendOtp = onCall({ secrets: [RESEND_API_KEY] }, async (request) => {
  const email = normalizeEmail(request.data?.email);
  if (!EMAIL_RE.test(email)) {
    throw new HttpsError('invalid-argument', 'Invalid email address.');
  }

  const ref = db.collection(COL.otpCodes).doc(otpDocId(email));
  const now = Date.now();
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const prev = snap.exists ? snap.data() : null;

    if (prev?.lastSentAt && now - prev.lastSentAt.toMillis() < RESEND_COOLDOWN_MS) {
      throw new HttpsError('resource-exhausted', 'Please wait a few seconds before requesting a new code.');
    }

    const windowStart = prev?.windowStart?.toMillis() ?? 0;
    const inWindow = now - windowStart < 60 * 60 * 1000;
    const sendsInWindow = inWindow ? (prev?.sendsInWindow ?? 0) : 0;
    if (sendsInWindow >= MAX_SENDS_PER_HOUR) {
      throw new HttpsError('resource-exhausted', 'Too many codes requested. Try again later.');
    }

    tx.set(ref, {
      codeHash: sha256(`${email}:${code}`),
      expiresAt: Timestamp.fromMillis(now + CODE_TTL_MS),
      attempts: 0,
      lastSentAt: Timestamp.fromMillis(now),
      windowStart: inWindow ? Timestamp.fromMillis(windowStart) : Timestamp.fromMillis(now),
      sendsInWindow: sendsInWindow + 1,
    });
  });

  // Local development: no real emails from the emulator, read the code in the logs.
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    logger.info(`[emulator] OTP for ${email}: ${code}`);
    return { ok: true };
  }

  try {
    await sendEmail({ to: email, subject: `Your Ago Log code: ${code}`, html: otpEmail(code) });
  } catch (err) {
    logger.error('sendOtp: email failed', err);
    throw new HttpsError('internal', 'Could not send the email. Please try again.');
  }

  return { ok: true };
});

/**
 * Step 2 of login: check the code, create the Auth user + users/{uid}
 * document on first login and return a custom token for signInWithCustomToken.
 * Input: { email, code }
 */
export const verifyOtp = onCall(async (request) => {
  const email = normalizeEmail(request.data?.email);
  const code = String(request.data?.code ?? '').trim();
  if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) {
    throw new HttpsError('invalid-argument', 'Invalid email or code.');
  }

  const ref = db.collection(COL.otpCodes).doc(otpDocId(email));

  const valid = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return 'missing';
    const data = snap.data();

    if (data.expiresAt.toMillis() < Date.now()) {
      tx.delete(ref);
      return 'expired';
    }
    if ((data.attempts ?? 0) >= MAX_ATTEMPTS) {
      tx.delete(ref);
      return 'locked';
    }

    const expected = Buffer.from(data.codeHash, 'hex');
    const actual = Buffer.from(sha256(`${email}:${code}`), 'hex');
    if (!timingSafeEqual(expected, actual)) {
      tx.update(ref, { attempts: FieldValue.increment(1) });
      return 'wrong';
    }

    tx.delete(ref);
    return 'ok';
  });

  if (valid !== 'ok') {
    const messages = {
      missing: 'No code was requested for this email. Request a new one.',
      expired: 'The code has expired. Request a new one.',
      locked: 'Too many wrong attempts. Request a new code.',
      wrong: 'Wrong code.',
    };
    throw new HttpsError('permission-denied', messages[valid]);
  }

  // Get or create the Auth user
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
    userRecord = await auth.createUser({ email, emailVerified: true });
  }
  if (userRecord.disabled) {
    throw new HttpsError('permission-denied', 'This account is disabled.');
  }

  // Make sure the profile document exists
  const userRef = db.collection(COL.users).doc(userRecord.uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    await userRef.set({
      email,
      name: null,
      avatar: null,
      phone: null,
      status: USER_STATUS.ACTIVE,
      plan: PLAN.FREE,
      pushEnabled: true,
      emailEnabled: false,
      expoPushToken: null,
      createdAt: new Date().toISOString(),
    });
  }

  const token = await auth.createCustomToken(userRecord.uid);
  return { token, uid: userRecord.uid };
});
