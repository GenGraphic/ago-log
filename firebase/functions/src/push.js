import { logger } from 'firebase-functions';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Sends the messages ({ title, body, data }) to one Expo push token.
 * Returns true if the token is no longer valid (so it can be removed from
 * the user profile).
 */
export async function sendExpoPush(token, messages) {
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
        data: m.data ?? {},
      })),
    ),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    logger.error(`Expo push HTTP ${response.status}`, result);
    throw new Error(`Expo push failed (${response.status})`);
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
 * Pushes to the user if push is enabled and a token is stored, and clears
 * the token when Expo reports the device as unregistered.
 * Returns true if a push was handed to Expo.
 */
export async function pushToUser(userRef, user, messages) {
  if (user.pushEnabled === false || !user.expoPushToken) return false;
  const tokenInvalid = await sendExpoPush(user.expoPushToken, messages);
  if (tokenInvalid) await userRef.update({ expoPushToken: null });
  return !tokenInvalid;
}
