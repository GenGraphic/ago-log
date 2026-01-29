import { createDocument, getDocument, listDocuments, updateDocument } from './helpers';
import { ReminderModel } from '../../types/reminder';

export async function createReminder(payload: Partial<ReminderModel>) {
  return await createDocument('reminders', payload);
}

export async function getReminder(id: string) {
  return await getDocument('reminders', id);
}

export async function updateReminder(id: string, payload: Partial<ReminderModel>) {
  return await updateDocument('reminders', id, payload);
}

export async function listUpcomingForUser(userId: string, limit = 50) {
  // Assumes documents have nextOccurrence field
  // Appwrite query syntax will be provided by caller as needed, simple list for now
  return await listDocuments('reminders', []);
}
