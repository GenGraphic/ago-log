import { useCallback, useState } from 'react';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

import Toast from 'react-native-toast-message';

import { db, DB_ID, USERS_TABLE_ID } from '@/appwrite';
import { RC_API_KEY, RC_ENTITLEMENT_ID, RC_PRODUCTS } from '@/constants/revenuecat';
import { UserPlan } from '@/models/enums';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/userSlice';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPlanFromCustomerInfo(customerInfo: CustomerInfo): UserPlan {
  return RC_ENTITLEMENT_ID in customerInfo.entitlements.active
    ? UserPlan.PRO
    : UserPlan.FREE;
}

async function persistPlanToDb(userId: string, plan: UserPlan) {
  await db.updateRow({
    databaseId: DB_ID,
    tableId: USERS_TABLE_ID,
    rowId: userId,
    data: { plan },
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRevenueCat() {
  const dispatch = useAppDispatch();
  const plan = useAppSelector((s) => s.user.plan);
  const userId = useAppSelector((s) => s.user.id);
  const [isLoading, setIsLoading] = useState(false);

  const isPro = plan === UserPlan.PRO;

  // ── Configure SDK (call once at app start) ──────────────────────────────
  const configure = useCallback((appUserId?: string) => {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey: RC_API_KEY, appUserID: appUserId });
  }, []);

  // ── Link app user with RevenueCat identity ──────────────────────────────
  const logIn = useCallback(async (userId: string) => {
    try {
      const { customerInfo } = await Purchases.logIn(userId);
      dispatch(updateUser({ plan: getPlanFromCustomerInfo(customerInfo) }));
    } catch {
      // Non-critical — user still works, just won't reflect subscription state
    }
  }, [dispatch]);

  // ── Log out (on sign out) ───────────────────────────────────────────────
  const logOut = useCallback(async () => {
    try {
      await Purchases.logOut();
      dispatch(updateUser({ plan: UserPlan.FREE }));
    } catch {
      // Not critical
    }
  }, [dispatch]);

  // ── Fetch latest customer info + persist plan ───────────────────────────
  const loadCustomerInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const newPlan = getPlanFromCustomerInfo(customerInfo);
      dispatch(updateUser({ plan: newPlan }));
      if (userId) {
        await persistPlanToDb(userId, newPlan);
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, userId]);

  // ── Purchase a specific plan directly (no RC paywall UI) ─────────────────
  const purchasePlan = useCallback(async (billing: 'monthly' | 'yearly'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.current;
      if (!offering) {
        Toast.show({ type: 'error', text1: 'No offerings available', text2: 'Please try again later.' });
        return false;
      }

      const packageType = billing === 'yearly' ? 'ANNUAL' : 'MONTHLY';
      const productId = billing === 'yearly' ? RC_PRODUCTS.yearly : RC_PRODUCTS.monthly;
      const pkg =
        offering.availablePackages.find((p) => p.packageType === packageType) ??
        offering.availablePackages.find((p) => p.product.identifier === productId);

      if (!pkg) {
        Toast.show({ type: 'error', text1: 'Product not found', text2: 'Please try again later.' });
        return false;
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const newPlan = getPlanFromCustomerInfo(customerInfo);
      dispatch(updateUser({ plan: newPlan }));
      if (userId) await persistPlanToDb(userId, newPlan);
      Toast.show({ type: 'success', text1: 'Welcome to Pro!', text2: 'Your account has been upgraded.' });
      return true;
    } catch (e: any) {
      if (!e.userCancelled) {
        Toast.show({ type: 'error', text1: 'Purchase failed', text2: e.message });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, userId]);

  // ── Present RC Paywall ──────────────────────────────────────────────────
  const presentPaywall = useCallback(async (): Promise<boolean> => {
    const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        await loadCustomerInfo();
        Toast.show({ type: 'success', text1: 'Welcome to Pro!', text2: 'Your account has been upgraded.' });
        return true;
      case PAYWALL_RESULT.RESTORED:
        await loadCustomerInfo();
        Toast.show({ type: 'success', text1: 'Purchases restored', text2: 'Your Pro access has been restored.' });
        return true;
      default:
        return false;
    }
  }, [loadCustomerInfo]);

  // ── Present RC Paywall only if not already entitled ─────────────────────
  const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
    const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: RC_ENTITLEMENT_ID,
    });
    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        await loadCustomerInfo();
        Toast.show({ type: 'success', text1: 'Welcome to Pro!', text2: 'Your account has been upgraded.' });
        return true;
      case PAYWALL_RESULT.RESTORED:
        await loadCustomerInfo();
        Toast.show({ type: 'success', text1: 'Purchases restored', text2: 'Your Pro access has been restored.' });
        return true;
      default:
        return false;
    }
  }, [loadCustomerInfo]);

  // ── Restore purchases ───────────────────────────────────────────────────
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const newPlan = getPlanFromCustomerInfo(customerInfo);
      dispatch(updateUser({ plan: newPlan }));
      if (userId) {
        await persistPlanToDb(userId, newPlan);
      }
      return newPlan === UserPlan.PRO;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, userId]);

  // ── Customer Center (self-serve subscription management) ─────────────────
  const presentCustomerCenter = useCallback(async () => {
    await RevenueCatUI.presentCustomerCenter({
      callbacks: {
        onRestoreCompleted: async ({ customerInfo }) => {
          const newPlan = getPlanFromCustomerInfo(customerInfo);
          dispatch(updateUser({ plan: newPlan }));
          if (userId) {
            await persistPlanToDb(userId, newPlan);
          }
          Toast.show({ type: 'success', text1: 'Purchases restored', text2: 'Your Pro access has been restored.' });
        },
      },
    });
  }, [dispatch, userId]);

  return {
    isPro,
    isLoading,
    configure,
    logIn,
    logOut,
    loadCustomerInfo,
    purchasePlan,
    presentPaywall,
    presentPaywallIfNeeded,
    restorePurchases,
    presentCustomerCenter,
  };
}
