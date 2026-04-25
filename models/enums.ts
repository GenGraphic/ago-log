export enum UserStatus {
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    DELETED = "Deleted",
};

export enum UserPlan {
    FREE = 'FREE',
    PRO  = 'PRO',
};

export enum Currency {
    EUR = 'EUR',
    RON  = 'RON',
    USD = 'USD',
};

// enums.ts
export enum EntryType {
  // Documents
  PASSPORT          = 'Passport',
  DRIVING_LICENSE   = 'Driving_License',
  ID_CARD           = 'ID_Card',
  VISA              = 'Visa',

  // Insurance
  CAR_INSURANCE     = 'Car_Insurance',
  HEALTH_INSURANCE  = 'Health_Insurance',
  HOME_INSURANCE    = 'Home_Insurance',
  TRAVEL_INSURANCE  = 'Travel_Insurance',

  // Vehicle
  CAR_INSPECTION    = 'Car_Inspection',       // MOT / TÜV
  CAR_MAINTENANCE   = 'Car_Maintenance',      // oil, tires, filters
  VEHICLE_REGISTRATION = 'Vehicle_Registration',
  VIGNETTE          = 'Vignette',              // road tax sticker

  // Medical
  VACCINATION       = 'Vaccination',
  PRESCRIPTION      = 'Prescription',
  MEDICAL_CHECKUP   = 'Medical_Checkup',

  // Finance / Legal
  SUBSCRIPTION      = 'Subscription',
  CONTRACT          = 'Contract',
  WARRANTY          = 'Warranty',
  PROPERTY_LEASE    = 'Property_Lease',

  // Personal
  BIRTHDAY          = 'Birthday',
  ANNIVERSARY       = 'Anniversary',

  // Secure
  CREDENTIAL        = 'Credential',           // password, PIN, account

  // Catch-all
  REMINDER          = 'Reminder',
}

export enum EntryStatus {
  ACTIVE   = 'Active',
  ARCHIVED = 'Archived',
  EXPIRED  = 'Expired',
}

export type NotifType = 'expired' | 'warning' | 'info' | 'sync';