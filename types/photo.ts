export interface PhotoModel {
  $id?: string;
  userId: string;
  storageId: string;
  filename?: string;
  ocrText?: string;
  labels?: string[];
  extractedDates?: string[]; // ISO strings
  createdAt?: string;
}
