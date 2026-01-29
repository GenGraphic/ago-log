export interface UserModel {
  $id?: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  // metadata can hold provider-specific data
  metadata?: Record<string, any>;
}
