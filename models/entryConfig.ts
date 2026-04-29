import { EntryType } from './enums';

export interface EntryFieldConfig {
  showExpiryDate: boolean;
  showIssuer: boolean;
  showIdentifier: boolean;
  showSecret: boolean;
  showUsername: boolean;
  showUrl: boolean;
  showLastServiceDate: boolean;
  showIntervalDays: boolean;
  showLastMileage: boolean;
  showMileageInterval: boolean;
  showNotifyDaysBefore: boolean;
  expiryLabel: string;
  showAmount: boolean;
  showCurrency: boolean;
}

const doc = (expiryLabel = 'Expiry Date'): EntryFieldConfig => ({
  showExpiryDate: true,
  showIssuer: true,
  showIdentifier: true,
  showSecret: false,
  showUsername: false,
  showUrl: false,
  showLastServiceDate: false,
  showIntervalDays: false,
  showLastMileage: false,
  showMileageInterval: false,
  showNotifyDaysBefore: true,
  expiryLabel,
  showAmount: false,
  showCurrency: false
});

const insurance = (): EntryFieldConfig => ({
  showExpiryDate: true,
  showIssuer: true,
  showIdentifier: true,
  showSecret: false,
  showUsername: false,
  showUrl: false,
  showLastServiceDate: false,
  showIntervalDays: false,
  showLastMileage: false,
  showMileageInterval: false,
  showNotifyDaysBefore: true,
  expiryLabel: 'Renewal Date',
  showAmount: true,
  showCurrency: true
});

const maintenance = (): EntryFieldConfig => ({
  showExpiryDate: false,
  showIssuer: false,
  showIdentifier: false,
  showSecret: false,
  showUsername: false,
  showUrl: false,
  showLastServiceDate: true,
  showIntervalDays: true,
  showLastMileage: true,
  showMileageInterval: true,
  showNotifyDaysBefore: true,
  expiryLabel: 'Due Date',
  showAmount: true,
  showCurrency: true
});

const reminder = (expiryLabel = 'Date'): EntryFieldConfig => ({
  showExpiryDate: true,
  showIssuer: false,
  showIdentifier: false,
  showSecret: false,
  showUsername: false,
  showUrl: false,
  showLastServiceDate: false,
  showIntervalDays: false,
  showLastMileage: false,
  showMileageInterval: false,
  showNotifyDaysBefore: true,
  expiryLabel,
  showAmount: false,
  showCurrency: false
});

export const ENTRY_CONFIG: Record<EntryType, EntryFieldConfig> = {
  // Documents
  [EntryType.PASSPORT]:              doc('Expiry Date'),
  [EntryType.DRIVING_LICENSE]:       doc('Expiry Date'),
  [EntryType.ID_CARD]:               doc('Expiry Date'),
  [EntryType.VISA]:                  doc('Expiry Date'),

  // Insurance
  [EntryType.CAR_INSURANCE]:         insurance(),
  [EntryType.HEALTH_INSURANCE]:      insurance(),
  [EntryType.HOME_INSURANCE]:        insurance(),
  [EntryType.TRAVEL_INSURANCE]:      insurance(),

  // Vehicle
  [EntryType.CAR_INSPECTION]:        doc('Inspection Due'),
  [EntryType.CAR_MAINTENANCE]:       maintenance(),
  [EntryType.VIGNETTE]:              doc('Renewal Date'),
  [EntryType.VEHICLE_REGISTRATION]:  doc('Renewal Date'),

  // Medical
  [EntryType.VACCINATION]:           doc('Next Dose Date'),
  [EntryType.PRESCRIPTION]:          doc('Expiry Date'),
  [EntryType.MEDICAL_CHECKUP]:       reminder('Checkup Date'),

  // Finance / Legal
  [EntryType.SUBSCRIPTION]:          { ...insurance(), expiryLabel: 'Renewal Date' },
  [EntryType.CONTRACT]:              doc('End Date'),
  [EntryType.WARRANTY]:              doc('Warranty Expiry'),
  [EntryType.PROPERTY_LEASE]:        doc('Lease End Date'),

  // Personal
  [EntryType.BIRTHDAY]:              reminder('Date of Birth'),
  [EntryType.ANNIVERSARY]:           reminder('Anniversary Date'),

  // Secure
  [EntryType.CREDENTIAL]: {
    showExpiryDate: false,
    showIssuer: false,
    showIdentifier: false,
    showSecret: true,
    showUsername: true,
    showUrl: true,
    showLastServiceDate: false,
    showIntervalDays: false,
    showLastMileage: false,
    showMileageInterval: false,
    showNotifyDaysBefore: false,
    expiryLabel: 'Expiry Date',
    showAmount: false,
    showCurrency: false
  },

  // Catch-all
  [EntryType.REMINDER]: reminder('Due Date'),
};
