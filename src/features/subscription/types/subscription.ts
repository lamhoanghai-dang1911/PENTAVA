import type {
  SubscriptionPlanItem,
  SubscriptionPurchaseInitResponse,
  UserSubscriptionDetailResponse,
} from "@/src/types/api/subscription";

export type SubscriptionModalState = {
  visible: boolean;
  title: string;
  message: string;
};

export type SubscriptionQrModalProps = {
  visible: boolean;
  transaction: SubscriptionPurchaseInitResponse | null;
  onClose: () => void;
  onCheckStatus: () => Promise<void>;
  isCheckingStatus: boolean;
  onMockConfirm?: () => Promise<void>;
  isMockConfirming?: boolean;
  statusMessage?: string | null;
};

export type UseSubscriptionResult = {
  plans: SubscriptionPlanItem[];
  selectedPlanCode: string | null;
  selectedPlan: SubscriptionPlanItem | null;
  mySubscription: UserSubscriptionDetailResponse | null;
  isLoading: boolean;
  isPurchasing: boolean;
  isCheckingStatus: boolean;
  isMockConfirming: boolean;
  activeTransaction: SubscriptionPurchaseInitResponse | null;
  errorModal: SubscriptionModalState;
  notificationModal: SubscriptionModalState;
  statusMessage: string | null;
  setSelectedPlanCode: (code: string) => void;
  loadData: () => Promise<void>;
  initPurchase: () => Promise<void>;
  checkStatus: () => Promise<void>;
  mockConfirm: () => Promise<void>;
  closeQrModal: () => void;
  closeErrorModal: () => void;
  closeNotificationModal: () => void;
};
