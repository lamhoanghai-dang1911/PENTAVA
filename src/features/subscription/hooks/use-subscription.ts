import { useCallback, useEffect, useRef, useState } from "react";
import { subscriptionService } from "@/src/services/subscriptionService";
import type {
  SubscriptionPlanItem,
  SubscriptionPurchaseInitResponse,
  UserSubscriptionDetailResponse,
} from "@/src/types/api/subscription";
import type {
  SubscriptionModalState,
  UseSubscriptionResult,
} from "@/src/features/subscription/types/subscription";

const INITIAL_MODAL_STATE: SubscriptionModalState = {
  visible: false,
  title: "",
  message: "",
};

export function useSubscription(): UseSubscriptionResult {
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
  const [mySubscription, setMySubscription] =
    useState<UserSubscriptionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isMockConfirming, setIsMockConfirming] = useState(false);
  const [activeTransaction, setActiveTransaction] =
    useState<SubscriptionPurchaseInitResponse | null>(null);
  const [errorModal, setErrorModal] = useState<SubscriptionModalState>(INITIAL_MODAL_STATE);
  const [notificationModal, setNotificationModal] =
    useState<SubscriptionModalState>(INITIAL_MODAL_STATE);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const isCheckingStatusRef = useRef(false);

  const selectedPlan =
    plans.find((p) => p.code.toUpperCase() === selectedPlanCode?.toUpperCase()) ??
    plans[0] ??
    null;

  const fetchSubscriptionData = useCallback(async () => {
    try {
      const [plansData, subResult] = await Promise.allSettled([
        subscriptionService.getPlans(),
        subscriptionService.getMySubscription(),
      ]);

      if (plansData.status === "fulfilled") {
        setPlans(plansData.value);
        if (plansData.value.length > 0) {
          setSelectedPlanCode((prev) => {
            if (prev) return prev;
            const featured =
              plansData.value.find(
                (p) => p.badge?.includes("VIP") || p.code === "PREMIUM",
              ) ?? plansData.value[0];
            return featured.code;
          });
        }
      } else {
        const errMessage =
          plansData.reason instanceof Error
            ? plansData.reason.message
            : "Không thể tải danh sách gói cước.";
        setErrorModal({
          visible: true,
          title: "Lỗi tải gói cước",
          message: errMessage,
        });
      }

      if (subResult.status === "fulfilled") {
        setMySubscription(subResult.value);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const subSnapshotRef = useRef<{
    hasSub: boolean;
    endDate: string | null;
    planCode: string | null;
  } | null>(null);

  useEffect(() => {
    void fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const initPurchase = useCallback(async () => {
    if (!selectedPlan) {
      setErrorModal({
        visible: true,
        title: "Thông báo",
        message: "Vui lòng chọn một gói cước để tiếp tục.",
      });
      return;
    }

    setIsPurchasing(true);
    setStatusMessage(null);
    try {
      // Lưu lại trạng thái gói cước hiện tại trước khi bắt đầu giao dịch
      subSnapshotRef.current = {
        hasSub: Boolean(mySubscription?.hasActiveSubscription),
        endDate: mySubscription?.endDate ?? null,
        planCode: mySubscription?.planCode ?? null,
      };

      const result = await subscriptionService.initPurchase({
        planCode: selectedPlan.code,
      });
      setActiveTransaction(result);
    } catch (error: any) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi tạo yêu cầu thanh toán.";
      setErrorModal({
        visible: true,
        title: "Lỗi khởi tạo thanh toán",
        message,
      });
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedPlan, mySubscription]);

  const checkStatus = useCallback(
    async (isManual = true) => {
      if (!activeTransaction || isCheckingStatusRef.current) return;

      isCheckingStatusRef.current = true;
      if (isManual) {
        setIsCheckingStatus(true);
        setStatusMessage(null);
      }
      try {
        const updatedSub = await subscriptionService.getMySubscription();
        setMySubscription(updatedSub);

        const snapshot = subSnapshotRef.current;
        // Chỉ xác nhận thành công nếu:
        // 1. Trước đó chưa có gói -> giờ kích hoạt thành công đúng gói
        // 2. Trước đó đã có gói -> gia hạn thành công (endDate thay đổi) hoặc đổi sang gói mới khác gói cũ
        const isPurchasedPlanActive =
          updatedSub.hasActiveSubscription &&
          Boolean(
            (!snapshot?.hasSub &&
              updatedSub.planCode?.toUpperCase() ===
                activeTransaction.planCode.toUpperCase()) ||
              (snapshot?.hasSub &&
                (updatedSub.planCode?.toUpperCase() !==
                  snapshot.planCode?.toUpperCase() ||
                  (updatedSub.endDate &&
                    snapshot.endDate &&
                    updatedSub.endDate !== snapshot.endDate))),
          );

        if (isPurchasedPlanActive) {
          setActiveTransaction(null);
          setStatusMessage(null);
          setNotificationModal({
            visible: true,
            title: "Thanh toán thành công 🎉",
            message: `Chúc mừng bạn đã kích hoạt thành công ${updatedSub.planName || activeTransaction.planName}!`,
          });
          void fetchSubscriptionData();
        } else if (isManual) {
          setStatusMessage(
            "Hệ thống chưa nhận được thanh toán. Nếu bạn đã chuyển khoản, vui lòng đợi 1-2 phút để ngân hàng xử lý.",
          );
        }
      } catch (error: any) {
        if (isManual) {
          const message =
            error instanceof Error
              ? error.message
              : "Không thể kiểm tra trạng thái gói cước.";
          setErrorModal({
            visible: true,
            title: "Lỗi kiểm tra trạng thái",
            message,
          });
        }
      } finally {
        isCheckingStatusRef.current = false;
        if (isManual) {
          setIsCheckingStatus(false);
        }
      }
    },
    [activeTransaction, fetchSubscriptionData],
  );

  useEffect(() => {
    if (!activeTransaction) return;

    // Polling ngầm mỗi 3 giây
    const interval = setInterval(() => {
      void checkStatus(false);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [activeTransaction?.transactionCode, checkStatus]);

  const mockConfirm = useCallback(async () => {
    if (!activeTransaction) return;

    setIsMockConfirming(true);
    try {
      await subscriptionService.mockConfirm(activeTransaction.transactionCode);
      const updatedSub = await subscriptionService.getMySubscription();
      setMySubscription(updatedSub);
      setActiveTransaction(null);
      setNotificationModal({
        visible: true,
        title: "Mô phỏng thành công 🎉",
        message: `Đã kích hoạt thành công ${updatedSub.planName || activeTransaction.planName} (Dev Test).`,
      });
    } catch (error: any) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể mô phỏng thanh toán thành công.";
      setErrorModal({
        visible: true,
        title: "Lỗi mô phỏng",
        message,
      });
    } finally {
      setIsMockConfirming(false);
    }
  }, [activeTransaction]);

  const closeQrModal = useCallback(() => {
    setActiveTransaction(null);
    setStatusMessage(null);
  }, []);

  const closeErrorModal = useCallback(() => {
    setErrorModal(INITIAL_MODAL_STATE);
  }, []);

  const closeNotificationModal = useCallback(() => {
    setNotificationModal(INITIAL_MODAL_STATE);
  }, []);

  return {
    plans,
    selectedPlanCode,
    selectedPlan,
    mySubscription,
    isLoading,
    isPurchasing,
    isCheckingStatus,
    isMockConfirming,
    activeTransaction,
    errorModal,
    notificationModal,
    statusMessage,
    setSelectedPlanCode,
    loadData,
    initPurchase,
    checkStatus,
    mockConfirm,
    closeQrModal,
    closeErrorModal,
    closeNotificationModal,
  };
}
