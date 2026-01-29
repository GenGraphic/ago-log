import { db, idGen } from '../../appwrite';
import { DB_ID } from './collections';

export async function createDocument(collectionId: string, data: any) {
  return await db.createDocument(DB_ID, collectionId, idGen.unique(), data);
}

export async function getDocument(collectionId: string, documentId: string) {
  return await db.getDocument(DB_ID, collectionId, documentId);
}

export async function updateDocument(collectionId: string, documentId: string, data: any) {
  return await db.updateDocument(DB_ID, collectionId, documentId, data);
}

export async function listDocuments(collectionId: string, queries: any[] = []) {
  return await db.listDocuments(DB_ID, collectionId, queries);
}
