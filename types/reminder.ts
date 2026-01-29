export type Recurrence = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'every2years' | 'none';

export interface AlertSetting {
  offsetsInDays: number[]; // e.g. [7,1,0]
}

export interface ReminderModel {
  $id?: string;
  userId: string;
  title: string;
  notes?: string;
  startDate: string; // ISO
  recurrence: Recurrence;
  nextOccurrence?: string; // ISO
  photoId?: string;
  done?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
