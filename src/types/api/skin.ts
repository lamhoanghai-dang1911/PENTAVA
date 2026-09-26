export type SkinSlot = "BASE" | "NECK" | "EYES" | "HEAD" | "ACCESSORY";

export type AvatarLayer = {
  layerOrder: number;
  slot: SkinSlot;
  code: string;
  name: string;
  imageUrl: string;
};

export type MyAvatarResponse = {
  userId: number;
  layers: AvatarLayer[];
};

export type SkinInventoryItem = {
  id: number;
  code: string;
  name: string;
  slot: SkinSlot;
  layerOrder: number;
  imageUrl: string;
  priceRuby: number;
  description: string;
  isEquipped: boolean;
};

export type EquipSkinRequest = {
  skinId: number;
};

export type UnequipSkinRequest = {
  slot: Exclude<SkinSlot, "BASE">;
};
