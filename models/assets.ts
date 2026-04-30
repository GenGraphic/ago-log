import { AssetType } from "./enums";

export interface Asset_DB {
  userId: string;
  name: string;
  type: AssetType;
  description?: string;

  // VEHICLE
  brand?: string;
  model?: string;
  year?: number;
  vin?: string;
  registrationNumber?: string;

  // HOME / LAND
  address?: string;
  rooms?: number;
  surface?: number;
  priceEvaluation?: number;
  constructionYear?: number;

  // BUSINESS
  businessName?: string;
  activityType?: string;
  foundedYear?: number;

  // PERSONAL / OTHER
  notes?: string;
};

export interface Asset extends Asset_DB {
  id: string;
  createdAt: Date;
}