import { skinService } from '@/src/services/skinService';
import type {
  MyAvatarResponse,
  SkinInventoryItem,
} from '@/src/types/api/skin';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SLOT_ORDER } from '../constants';
import type { UseWardrobeResult } from '../types/wardrobe';

export function useWardrobe(): UseWardrobeResult {
  const [avatar, setAvatar] = useState<MyAvatarResponse | null>(null);
  const [inventory, setInventory] = useState<SkinInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const isMounted = useRef(true);

  const requestWardrobe = useCallback(
    () =>
      Promise.all([
        skinService.getMyAvatar(),
        skinService.getMyInventory(),
      ]),
    [],
  );

  const handleWardrobeError = useCallback((loadError: unknown) => {
    if (!isMounted.current) return;
    setError(
      loadError instanceof Error
        ? loadError.message
        : 'Không thể tải kho trang phục.',
    );
  }, []);

  const handleWardrobeLoaded = useCallback(
    ([myAvatar, myInventory]: [MyAvatarResponse, SkinInventoryItem[]]) => {
      if (!isMounted.current) return;
      setAvatar(myAvatar);
      setInventory(myInventory);
    },
    [],
  );

  const finishLoading = useCallback(() => {
    if (isMounted.current) setIsLoading(false);
  }, []);

  const loadWardrobe = useCallback(() => {
    setIsLoading(true);
    setError(null);
    void requestWardrobe()
      .then(handleWardrobeLoaded)
      .catch(handleWardrobeError)
      .finally(finishLoading);
  }, [finishLoading, handleWardrobeError, handleWardrobeLoaded, requestWardrobe]);

  useEffect(() => {
    isMounted.current = true;
    void requestWardrobe()
      .then(handleWardrobeLoaded)
      .catch(handleWardrobeError)
      .finally(finishLoading);

    return () => {
      isMounted.current = false;
    };
  }, [finishLoading, handleWardrobeError, handleWardrobeLoaded, requestWardrobe]);

  const handleEquip = useCallback(async (item: SkinInventoryItem) => {
    setActiveItemId(item.id);
    setActionError(null);
    try {
      const updatedAvatar = await skinService.equipSkin(item.id);
      if (!isMounted.current) return;
      setAvatar(updatedAvatar);
      setInventory((current) =>
        current.map((inventoryItem) => ({
          ...inventoryItem,
          isEquipped:
            inventoryItem.slot === item.slot && inventoryItem.id === item.id,
        })),
      );
    } catch (equipError) {
      if (isMounted.current) {
        setActionError(
          equipError instanceof Error
            ? equipError.message
            : 'Không thể trang bị vật phẩm.',
        );
      }
    } finally {
      if (isMounted.current) setActiveItemId(null);
    }
  }, []);

  const handleUnequip = useCallback(async (item: SkinInventoryItem) => {
    if (item.slot === 'BASE') return;
    setActiveItemId(item.id);
    setActionError(null);
    try {
      const updatedAvatar = await skinService.unequipSkin(item.slot);
      if (!isMounted.current) return;
      setAvatar(updatedAvatar);
      setInventory((current) =>
        current.map((inventoryItem) =>
          inventoryItem.slot === item.slot
            ? { ...inventoryItem, isEquipped: false }
            : inventoryItem,
        ),
      );
    } catch (unequipError) {
      if (isMounted.current) {
        setActionError(
          unequipError instanceof Error
            ? unequipError.message
            : 'Không thể gỡ vật phẩm.',
        );
      }
    } finally {
      if (isMounted.current) setActiveItemId(null);
    }
  }, []);

  const sortedInventory = useMemo(
    () =>
      [...inventory].sort(
        (left, right) =>
          SLOT_ORDER[left.slot] - SLOT_ORDER[right.slot] ||
          left.layerOrder - right.layerOrder ||
          left.id - right.id,
      ),
    [inventory],
  );

  return {
    avatar,
    inventory,
    isLoading,
    error,
    actionError,
    activeItemId,
    sortedInventory,
    loadWardrobe,
    handleEquip,
    handleUnequip,
  };
}
