import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { auth, COL, db, storage } from './config.js';

async function deleteWhereUser(collection, uid) {
  const snap = await db.collection(collection).where('userId', '==', uid).get();
  const writer = db.bulkWriter();
  snap.docs.forEach((d) => writer.delete(d.ref));
  await writer.close();
  return snap.size;
}

/**
 * Deletes everything that belongs to the calling user:
 * entries, assets, notifications, uploaded files, profile and Auth account.
 */
export const deleteAccount = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'You must be signed in.');

  const counts = {};
  for (const col of [COL.entries, COL.assets, COL.notifications]) {
    counts[col] = await deleteWhereUser(col, uid);
  }

  await storage.bucket().deleteFiles({ prefix: `users/${uid}/` }).catch((err) => {
    logger.warn('deleteAccount: storage cleanup failed', err);
  });

  await db.collection(COL.users).doc(uid).delete();
  await auth.deleteUser(uid);

  logger.info('Account deleted', { uid, counts });
  return { ok: true };
});
