import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import type {
  EquipSkinRequest,
  MyAvatarResponse,
  SkinInventoryItem,
  UnequipSkinRequest,
} from "@/src/types/api/skin";

export const skinService = {
  async getMyAvatar(): Promise<MyAvatarResponse> {
    const response = await apiClient.get<MyAvatarResponse>(
      API_ENDPOINTS.SKIN.MY_AVATAR,
    );
    return response.data;
  },

  async getMyInventory(): Promise<SkinInventoryItem[]> {
    const response = await apiClient.get<SkinInventoryItem[]>(
      API_ENDPOINTS.SKIN.INVENTORY,
    );
    return response.data;
  },

  async equipSkin(skinId: number): Promise<MyAvatarResponse> {
    const request: EquipSkinRequest = { skinId };
    const response = await apiClient.post<MyAvatarResponse>(
      API_ENDPOINTS.SKIN.EQUIP,
      request,
    );
    return response.data;
  },

  async unequipSkin(slot: UnequipSkinRequest["slot"]): Promise<MyAvatarResponse> {
    const request: UnequipSkinRequest = { slot };
    const response = await apiClient.post<MyAvatarResponse>(
      API_ENDPOINTS.SKIN.UNEQUIP,
      request,
    );
    return response.data;
  },
};
