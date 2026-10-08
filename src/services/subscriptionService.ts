import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import type {
  MockConfirmSubscriptionResponse,
  SubscriptionPlanItem,
  SubscriptionPurchaseInitRequest,
  SubscriptionPurchaseInitResponse,
  UserAllEntitlementsResponse,
  UserEntitlementCheckResponse,
  UserSubscriptionDetailResponse,
} from "@/src/types/api/subscription";

export class SubscriptionServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly rawError?: unknown,
  ) {
    super(message);
    this.name = "SubscriptionServiceError";
  }
}

function createSubscriptionError(error: any, fallback: string): SubscriptionServiceError {
  let message = fallback;
  const data = error?.response?.data;

  if (data) {
    if (typeof data === "string" && data.trim().length > 0) {
      message = data;
    } else if (typeof data.message === "string" && data.message.trim().length > 0) {
      message = data.message;
    } else if (typeof data.error === "string" && data.error.trim().length > 0) {
      message = data.error;
    } else if (typeof data === "object") {
      const messages = Object.values(data).filter(
        (val): val is string => typeof val === "string" && val.length > 0,
      );
      if (messages.length > 0) {
        message = messages.join("\n");
      }
    }
  } else if (typeof error?.message === "string" && error.message.trim().length > 0) {
    message = error.message;
  }

  return new SubscriptionServiceError(message, error?.response?.status, error);
}

export const subscriptionService = {
  /**
   * Xem danh sách các gói cước đang mở bán kèm các tính năng tương ứng (Công khai)
   * GET /api/shop/subscription/plans
   */
  async getPlans(): Promise<SubscriptionPlanItem[]> {
    try {
      const response = await apiClient.get<SubscriptionPlanItem[]>(
        API_ENDPOINTS.SUBSCRIPTION.PLANS,
      );
      return response.data;
    } catch (error: any) {
      throw createSubscriptionError(error, "Không thể tải danh sách gói cước.");
    }
  },

  /**
   * Xem thông tin gói cước và quyền lợi hiện tại của người dùng đang đăng nhập
   * GET /api/shop/subscription/my-subscription
   */
  async getMySubscription(): Promise<UserSubscriptionDetailResponse> {
    try {
      const response = await apiClient.get<UserSubscriptionDetailResponse>(
        API_ENDPOINTS.SUBSCRIPTION.MY_SUBSCRIPTION,
      );
      return response.data;
    } catch (error: any) {
      throw createSubscriptionError(
        error,
        "Không thể tải thông tin gói cước hiện tại của bạn.",
      );
    }
  },

  /**
   * Khởi tạo yêu cầu mua gói cước (Tạo mã giao dịch và mã VietQR SePay để thanh toán)
   * POST /api/shop/subscription/init
   */
  async initPurchase(
    request: SubscriptionPurchaseInitRequest,
  ): Promise<SubscriptionPurchaseInitResponse> {
    try {
      const response = await apiClient.post<SubscriptionPurchaseInitResponse>(
        API_ENDPOINTS.SUBSCRIPTION.INIT,
        request,
      );
      return response.data;
    } catch (error: any) {
      throw createSubscriptionError(
        error,
        "Không thể khởi tạo giao dịch mua gói cước.",
      );
    }
  },

  /**
   * Lấy tất cả các quyền lợi còn hiệu lực của một người dùng
   * GET /api/shop/subscription/entitlements/{userId}
   */
  async getAllEntitlements(userId: number): Promise<UserAllEntitlementsResponse> {
    try {
      const response = await apiClient.get<UserAllEntitlementsResponse>(
        API_ENDPOINTS.SUBSCRIPTION.ENTITLEMENTS(userId),
      );
      return response.data;
    } catch (error: any) {
      throw createSubscriptionError(
        error,
        `Không thể lấy quyền lợi cho người dùng ID ${userId}.`,
      );
    }
  },

  /**
   * Kiểm tra xem một người dùng có sở hữu tính năng nhất định hay không
   * GET /api/shop/subscription/entitlement/check?userId=...&featureCode=...
   */
  async checkEntitlement(
    userId: number,
    featureCode: string,
  ): Promise<UserEntitlementCheckResponse> {
    try {
      const response = await apiClient.get<UserEntitlementCheckResponse>(
        API_ENDPOINTS.SUBSCRIPTION.CHECK_ENTITLEMENT,
        {
          params: { userId, featureCode },
        },
      );
      return response.data;
    } catch (error: any) {
      throw createSubscriptionError(
        error,
        `Không thể kiểm tra tính năng "${featureCode}".`,
      );
    }
  },

  /**
   * Giả lập thanh toán thành công cho đơn mua gói cước (Dành cho Dev / Test)
   * POST /api/shop/subscription/mock-confirm/{transactionCode}
   */
  async mockConfirm(
    transactionCode: string,
  ): Promise<MockConfirmSubscriptionResponse> {
    try {
      const response = await apiClient.post<MockConfirmSubscriptionResponse>(
        API_ENDPOINTS.SUBSCRIPTION.MOCK_CONFIRM(transactionCode),
      );
      return response.data;
    } catch (error: any) {
      throw createSubscriptionError(
        error,
        "Không thể giả lập thanh toán gói cước.",
      );
    }
  },
};
