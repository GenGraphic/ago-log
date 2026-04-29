// models/assets.ts
// Asset interface for the Assets screen/tab

import { AssetType } from './enums';

export interface Asset_DB {
    userId: string;

    name: string; 
    type: AssetType;

    description?: string;
    metadata?: {
        brand?: string;
        model?: string;
        year?: number;

        address?: string;
    };
}

export interface Asset extends Asset_DB {
    id: string;
    createdAt: string;
    userId: string;

    name: string; 
    type: AssetType;

    description?: string;
    metadata?: {
        brand?: string;
        model?: string;
        year?: number;

        address?: string;
    };
}
