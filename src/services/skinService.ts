import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { cacheManager } from "@/src/services/cacheManager";
import type {
  EquipSkinRequest,
  MyAvatarResponse,
  SkinInventoryItem,
  UnequipSkinRequest,
} from "@/src/types/api/skin";

const AVATAR_CACHE_KEY = "skin:my-avatar";
const INVENTORY_CACHE_KEY = "skin:inventory";

export const skinService = {
  async getMyAvatar(forceRefresh = false): Promise<MyAvatarResponse> {
    return cacheManager.fetchWithCache(
      AVATAR_CACHE_KEY,
      async () => {
        const response = await apiClient.get<MyAvatarResponse>(
          API_ENDPOINTS.SKIN.MY_AVATAR,
        );
        return response.data;
      },
      60000,
      forceRefresh,
    );
  },

  async getMyInventory(forceRefresh = false): Promise<SkinInventoryItem[]> {
    return cacheManager.fetchWithCache(
      INVENTORY_CACHE_KEY,
      async () => {
        const response = await apiClient.get<SkinInventoryItem[]>(
          API_ENDPOINTS.SKIN.INVENTORY,
        );
        return response.data;
      },
      60000,
      forceRefresh,
    );
  },

  async equipSkin(skinId: number): Promise<MyAvatarResponse> {
    const request: EquipSkinRequest = { skinId };
    const response = await apiClient.post<MyAvatarResponse>(
      API_ENDPOINTS.SKIN.EQUIP,
      request,
    );
    cacheManager.set(AVATAR_CACHE_KEY, response.data, 60000);
    cacheManager.invalidate(INVENTORY_CACHE_KEY);
    return response.data;
  },

  async unequipSkin(slot: UnequipSkinRequest["slot"]): Promise<MyAvatarResponse> {
    const request: UnequipSkinRequest = { slot };
    const response = await apiClient.post<MyAvatarResponse>(
      API_ENDPOINTS.SKIN.UNEQUIP,
      request,
    );
    cacheManager.set(AVATAR_CACHE_KEY, response.data, 60000);
    cacheManager.invalidate(INVENTORY_CACHE_KEY);
    return response.data;
  },
};

