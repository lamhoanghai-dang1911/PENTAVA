import { Design, FontFamily } from "@/src/constants/design";
import { skinService } from "@/src/services/skinService";
import type {
  AvatarLayer,
  MyAvatarResponse,
  SkinInventoryItem,
  SkinSlot,
} from "@/src/types/api/skin";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function AvatarPreview({ layers }: { layers: AvatarLayer[] }) {
  const orderedLayers = [...layers].sort(
    (left, right) => left.layerOrder - right.layerOrder,
  );

  return (
    <View accessibilityLabel="Trang phục avatar hiện tại" style={styles.avatarPreview}>
      {orderedLayers.map((layer) => (
        <Image
          key={`${layer.layerOrder}-${layer.code}`}
          contentFit="contain"
          source={{ uri: layer.imageUrl }}
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateY: layer.slot === "BASE" ? 0 : -19 }], //render đồ vật tọa độ
              zIndex: layer.layerOrder,
            },
          ]}
        />
      ))}
      {orderedLayers.length === 0 ? (
        <Text style={styles.emptyAvatar}>Chưa có hình ảnh avatar</Text>
      ) : null}
    </View>
  );
}

const SLOT_ORDER: Record<SkinSlot, number> = {
  BASE: 0,
  NECK: 1,
  EYES: 2,
  HEAD: 3,
  ACCESSORY: 4,
};

const SLOT_NAMES: Record<SkinSlot, string> = {
  BASE: "Thân",
  HEAD: "Mũ",
  NECK: "Khăn",
  EYES: "Kính",
  ACCESSORY: "Phụ kiện",
};

function InventoryCard({
  item,
  isEquipped,
  isBusy,
  hasActiveItem,
  onEquip,
  onUnequip,
}: {
  item: SkinInventoryItem;
  isEquipped: boolean;
  isBusy: boolean;
  hasActiveItem: boolean;
  onEquip: () => void;
  onUnequip: () => void;
}) {
  const canUnequip = item.slot !== "BASE";

  return (
    <View style={styles.inventoryCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.slotBadge}>
          <Text style={styles.slotBadgeText}>{SLOT_NAMES[item.slot] ?? item.slot}</Text>
        </View>
        {isEquipped && (
          <View style={styles.equippedBadge}>
            <Ionicons color="#059669" name="checkmark-circle" size={12} />
            <Text style={styles.equippedBadgeText}>Đang mặc</Text>
          </View>
        )}
      </View>

      <View style={styles.itemImageShowcase}>
        <Image
          contentFit="contain"
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
        />
      </View>

      <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>

      <Pressable
        accessibilityLabel={isEquipped ? "Gỡ trang phục" : "Trang bị"}
        accessibilityRole="button"
        disabled={isBusy || hasActiveItem || (isEquipped && !canUnequip)}
        onPress={isEquipped ? onUnequip : onEquip}
        style={({ pressed }) => [
          styles.itemAction,
          isEquipped && (canUnequip ? styles.unequipAction : styles.baseItemAction),
          (pressed || isBusy) && styles.itemActionPressed,
        ]}
      >
        {isBusy ? (
          <ActivityIndicator color={Design.colors.white} size="small" />
        ) : (
          <Text style={[
            styles.itemActionText,
            isEquipped && (canUnequip ? styles.unequipActionText : styles.baseItemActionText),
          ]}>
            {isEquipped
              ? canUnequip
                ? "Gỡ bỏ"
                : "Mặc định"
              : "Mặc ngay ✨"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export default function WardrobeScreen() {
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
    if (isMounted.current) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải kho trang phục.",
      );
    }
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

  const loadWardrobe = () => {
    setIsLoading(true);
    setError(null);
    void requestWardrobe()
      .then(handleWardrobeLoaded)
      .catch(handleWardrobeError)
      .finally(finishLoading);
  };

  const handleEquip = async (item: SkinInventoryItem) => {
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
            : "Không thể trang bị vật phẩm.",
        );
      }
    } finally {
      if (isMounted.current) setActiveItemId(null);
    }
  };

  const handleUnequip = async (item: SkinInventoryItem) => {
    if (item.slot === "BASE") return;
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
            : "Không thể gỡ vật phẩm.",
        );
      }
    } finally {
      if (isMounted.current) setActiveItemId(null);
    }
  };

  const sortedInventory = [...inventory].sort(
    (left, right) =>
      SLOT_ORDER[left.slot] - SLOT_ORDER[right.slot] ||
      left.layerOrder - right.layerOrder ||
      left.id - right.id,
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
        >
          <Ionicons color="#1E293B" name="chevron-back" size={24} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Kho trang phục</Text>
          <Text style={styles.headerSubtitle}>Tùy biến phong cách cho linh vật</Text>
        </View>
        <View style={styles.inventoryCountBadge}>
          <Text style={styles.inventoryCountText}>🎒 {inventory.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={loadWardrobe}
            refreshing={isLoading}
            tintColor={Design.colors.primaryGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            {!avatar ? (
              <Pressable
                accessibilityRole="button"
                onPress={loadWardrobe}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {isLoading && !avatar ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
            <Text style={styles.loadingText}>Đang tải kho trang phục...</Text>
          </View>
        ) : avatar ? (
          <>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewBadge}>
                  <Ionicons color="#059669" name="sparkles" size={13} />
                  <Text style={styles.previewBadgeText}>Avatar hiện tại</Text>
                </View>
                <Text style={styles.previewLayersCount}>
                  {avatar.layers.length} lớp trang phục
                </Text>
              </View>
              <AvatarPreview layers={avatar.layers} />
            </View>

            <View style={styles.inventorySection}>
              {actionError ? (
                <Text accessibilityRole="alert" style={styles.actionError}>
                  {actionError}
                </Text>
              ) : null}
              {inventory.length === 0 ? (
                <Text style={styles.emptyInventory}>
                  Kho đồ của bạn đang trống. Hãy ghé Cửa hàng nhé!
                </Text>
              ) : (
                sortedInventory.map((item) => (
                  <InventoryCard
                    item={item}
                    isEquipped={avatar.layers.some(
                      (layer) => layer.code === item.code,
                    )}
                    isBusy={activeItemId === item.id}
                    hasActiveItem={activeItemId !== null}
                    key={item.id}
                    onEquip={() => void handleEquip(item)}
                    onUnequip={() => void handleUnequip(item)}
                  />
                ))
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F8FAF7",
    flex: 1,
  },
  header: {
    alignItems: "center",
    backgroundColor: Design.colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF5EE",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: "#0F291E",
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 18,
  },
  headerSubtitle: {
    color: "#64748B",
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 11,
    marginTop: 1,
  },
  inventoryCountBadge: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inventoryCountText: {
    color: "#059669",
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 12,
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 36,
  },
  loading: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 60,
  },
  loadingText: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
  },
  errorCard: {
    alignItems: "center",
    backgroundColor: "#FFF1F0",
    borderRadius: 14,
    gap: 12,
    padding: 16,
  },
  errorText: {
    color: "#A93232",
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  retryText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption,
  },
  previewCard: {
    backgroundColor: Design.colors.white,
    borderColor: "#D1FAE5",
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  previewBadgeText: {
    color: "#065F46",
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 12,
  },
  previewLayersCount: {
    color: "#64748B",
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 12,
  },
  avatarPreview: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
    borderRadius: 18,
    borderWidth: 1,
    height: 280,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  emptyAvatar: {
    alignSelf: "center",
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    marginTop: 120,
  },
  inventorySection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyInventory: {
    backgroundColor: Design.colors.white,
    borderColor: "#E2EFE6",
    borderRadius: 16,
    borderWidth: 1,
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    padding: 24,
    textAlign: "center",
    width: "100%",
  },
  inventoryCard: {
    backgroundColor: Design.colors.white,
    borderColor: "#E2EFE6",
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 14,
    padding: 10,
    width: "48%",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  slotBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  slotBadgeText: {
    color: "#475569",
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 10,
  },
  equippedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  equippedBadgeText: {
    color: "#059669",
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 10,
  },
  itemImageShowcase: {
    alignItems: "center",
    backgroundColor: "#F8FAF8",
    borderRadius: 14,
    height: 96,
    justifyContent: "center",
    marginBottom: 8,
    width: "100%",
  },
  itemImage: {
    height: 84,
    width: "84%",
  },
  itemName: {
    color: "#0F291E",
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 12.5,
    marginBottom: 8,
    textAlign: "center",
  },
  itemAction: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 10,
    width: "100%",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  unequipAction: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  baseItemAction: {
    backgroundColor: "#F1F5F9",
    shadowOpacity: 0,
    elevation: 0,
  },
  itemActionPressed: {
    transform: [{ scale: 0.96 }],
  },
  itemActionText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 11,
  },
  unequipActionText: {
    color: "#E11D48",
  },
  baseItemActionText: {
    color: "#64748B",
  },
  actionError: {
    backgroundColor: "#FFF1F0",
    borderRadius: 12,
    color: "#A93232",
    fontFamily: FontFamily.beVietnamRegular,
    marginBottom: 12,
    padding: 12,
    width: "100%",
  },
});
