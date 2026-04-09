export type BillingCycle = 'yearly' | 'monthly';

export const FREE_LOG_LIMIT = 5;

export const PLAN_PRICE: Record<BillingCycle, { amount: string; period: string; note: string }> = {
  yearly:  { amount: '€29.99', period: '/YEAR',  note: 'BILLED ANNUALLY — SAVE 40%' },
  monthly: { amount: '€3.99',  period: '/MONTH', note: 'BILLED MONTHLY' },
};

export const PRO_FEATURES = [
  'Unlimited logs — no hard cap ever',
  'Push & email notifications',
  'Manual entry + AI scan (unrestricted)',
];

export const PLAN_COMPARISON = [
  { label: 'Log limit',     free: '5 logs total',  pro: 'Unlimited' },
  { label: 'Manual entry',  free: '✓',             pro: '✓'         },
  { label: 'AI scan',       free: '✓',             pro: '✓'         },
  { label: 'Notifications', free: '✓',             pro: '✓'         },
  { label: 'Hard cap',      free: 'After 5 logs',  pro: 'Never'     },
];
