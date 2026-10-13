import { useCallback, useEffect, useState } from 'react';
import { subscriptionService } from '@/src/services/subscriptionService';
import type { UserSubscriptionDetailResponse } from '@/src/types/api/subscription';

export type EntitlementFeature =
  | 'MULTI_ANGLE_TEMPLATES'
  | 'CUSTOM_ROADMAP'
  | 'STORAGE_EXPANSION'
  | 'STREAK_PROTECTION'
  | 'UNLOCK_ALL_SKINS'
  | 'RUBY_BONUS';

export function useEntitlement() {
  const [subscription, setSubscription] = useState<UserSubscriptionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntitlements = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionService.getMySubscription();
      setSubscription(data);
      return data;
    } catch {
      setSubscription(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEntitlements();
  }, [fetchEntitlements]);

  const hasFeature = useCallback(
    (featureCode: EntitlementFeature | string): boolean => {
      if (!subscription || !subscription.hasActiveSubscription) {
        return false;
      }
      return Boolean(
        subscription.activeFeatures?.some(
          (f) => f.featureCode?.toUpperCase() === featureCode.toUpperCase() && f.isEnabled,
        ),
      );
    },
    [subscription],
  );

  const isSubscribed = Boolean(subscription?.hasActiveSubscription);

  return {
    subscription,
    isLoading,
    isSubscribed,
    hasFeature,
    refresh: fetchEntitlements,
  };
}
