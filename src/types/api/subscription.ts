export type PlanFeatureItem = {
  featureId: number;
  featureCode: string;
  name: string;
  description: string;
  isEnabled: boolean;
  paramValue?: string | null;
  displayLabel?: string | null;
  unit?: string | null;
};

export type SubscriptionPlanItem = {
  id: number;
  code: string;
  name: string;
  priceVnd: number;
  durationDays: number;
  description: string;
  badge?: string | null;
  isActive: boolean;
  displayOrder: number;
  features: PlanFeatureItem[];
};

export type SubscriptionPurchaseInitRequest = {
  planCode: string;
};

export type SubscriptionPurchaseInitResponse = {
  transactionCode: string;
  amountVnd: number;
  planCode: string;
  planName: string;
  durationDays: number;
  description?: string | null;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrCodeUrl: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | string;
  createdAt: string;
};

export type UserSubscriptionDetailResponse = {
  userId: number;
  hasActiveSubscription: boolean;
  planCode?: string | null;
  planName?: string | null;
  badge?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  daysRemaining: number;
  activeFeatures: PlanFeatureItem[];
};

export type UserEntitlementCheckResponse = {
  userId: number;
  featureCode: string;
  hasEntitlement: boolean;
  paramValue?: string | null;
  displayLabel?: string | null;
  planCode?: string | null;
  expiresAt?: string | null;
};

export type UserAllEntitlementsResponse = {
  userId: number;
  hasActiveSubscription: boolean;
  planCode?: string | null;
  planName?: string | null;
  expiresAt?: string | null;
  entitlements: PlanFeatureItem[];
};

export type MockConfirmSubscriptionResponse = {
  success: boolean;
  message: string;
};
