import type {
  AvatarLayer,
  MyAvatarResponse,
  SkinInventoryItem,
} from '@/src/types/api/skin';

export type AvatarPreviewProps = {
  layers: AvatarLayer[];
};

export type WardrobeHeaderProps = {
  inventoryCount: number;
  onBack: () => void;
};

export type InventoryCardProps = {
  item: SkinInventoryItem;
  isEquipped: boolean;
  isBusy: boolean;
  hasActiveItem: boolean;
  onEquip: () => void;
  onUnequip: () => void;
};

export type WardrobeContentProps = {
  avatar: MyAvatarResponse | null;
  inventory: SkinInventoryItem[];
  sortedInventory: SkinInventoryItem[];
  isLoading: boolean;
  error: string | null;
  actionError: string | null;
  activeItemId: number | null;
  onRefresh: () => void;
  onEquip: (item: SkinInventoryItem) => void;
  onUnequip: (item: SkinInventoryItem) => void;
};

export type UseWardrobeResult = {
  avatar: MyAvatarResponse | null;
  inventory: SkinInventoryItem[];
  isLoading: boolean;
  error: string | null;
  actionError: string | null;
  activeItemId: number | null;
  sortedInventory: SkinInventoryItem[];
  loadWardrobe: () => void;
  handleEquip: (item: SkinInventoryItem) => Promise<void>;
  handleUnequip: (item: SkinInventoryItem) => Promise<void>;
};
