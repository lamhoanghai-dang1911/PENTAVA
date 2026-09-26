import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import type {
  BuyShopItemResponse,
  InitTopupRequest,
  InitTopupResponse,
  ShopItem,
  TopupHistoryItem,
  WalletResponse,
} from "@/src/types/api/shop";

export class ShopServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ShopServiceError";
  }
}

function createShopError(error: any, fallback: string) {
  return new ShopServiceError(
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback,
    error?.response?.status,
  );
}

export const shopService = {
  async initTopup(data: InitTopupRequest): Promise<InitTopupResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.SHOP.INIT_TOPUP,
        data,
      );
      return response.data;
    } catch (error: any) {
      throw createShopError(error, "Không thể khởi tạo giao dịch nạp Ruby.");
    }
  },

  async buyItem(skinItemId: number): Promise<BuyShopItemResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.SHOP.BUY_ITEM(skinItemId),
      );
      return response.data;
    } catch (error: any) {
      throw createShopError(error, "Không thể mua skin.");
    }
  },

  async getItems(): Promise<ShopItem[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SHOP.ITEMS);
      return response.data;
    } catch (error: any) {
      throw createShopError(error, "Không thể tải danh sách skin.");
    }
  },

  async getMyWallet(): Promise<WalletResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SHOP.MY_WALLET);
      return response.data;
    } catch (error: any) {
      throw createShopError(error, "Không thể lấy số dư Ruby.");
    }
  },

  async getTopupHistory(): Promise<TopupHistoryItem[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SHOP.TOPUP_HISTORY);
      return response.data;
    } catch (error: any) {
      throw createShopError(error, "Không thể kiểm tra lịch sử nạp Ruby.");
    }
  },
};
