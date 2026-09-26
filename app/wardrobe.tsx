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
      <Image
        contentFit="contain"
        source={{ uri: item.imageUrl }}
        style={styles.itemImage}
      />
      <Pressable
        accessibilityLabel={isEquipped ? "Gỡ trang phục" : "Trang bị"}
        accessibilityRole="button"
        disabled={isBusy || hasActiveItem || (isEquipped && !canUnequip)}
        onPress={isEquipped ? onUnequip : onEquip}
        style={({ pressed }) => [
          styles.itemAction,
          isEquipped && styles.unequipAction,
          (pressed || isBusy) && styles.itemActionPressed,
        ]}
      >
        {isBusy ? (
          <ActivityIndicator color={Design.colors.white} size="small" />
        ) : (
          <Text style={styles.itemActionText}>
            {isEquipped
              ? canUnequip
                ? "Gỡ"
                : "Đang mặc"
              : "Trang bị"}
          </Text>
        )}
      </Pressable>
      {isEquipped ? (
        <View style={styles.equippedIndicator}>
          <Ionicons
            accessibilityLabel="Đang trang bị"
            color={Design.colors.white}
            name="checkmark"
            size={14}
          />
        </View>
      ) : null}
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
          style={styles.backButton}
        >
          <Ionicons color={Design.colors.black} name="arrow-back" size={23} />
        </Pressable>
        <Text style={styles.headerTitle}>Kho trang phục</Text>
        <View style={styles.headerSpacer} />
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
              {/* <Text style={styles.sectionTitle}>Avatar hiện tại</Text> */}
              <AvatarPreview layers={avatar.layers} />
              {/* <Text style={styles.previewCaption}>
                {avatar.layers.length} lớp trang phục đang hiển thị
              </Text> */}
            </View>

            <View style={styles.inventorySection}>
              {actionError ? (
                <Text accessibilityRole="alert" style={styles.actionError}>
                  {actionError}
                </Text>
              ) : null}
              {inventory.length === 0 ? (
                <Text style={styles.emptyInventory}>
                  Kho đồ của bạn đang trống.
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
  },
  backButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 32,
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
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  retryText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption,
  },
  previewCard: {
    alignItems: "center",
    backgroundColor: Design.colors.white,
    borderColor: "#E8EEE8",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  sectionTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
  },
  avatarPreview: {
    backgroundColor: "#F1F6EF",
    borderRadius: 18,
    height: 270,
    marginTop: 16,
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
  previewCaption: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    marginTop: 12,
  },
  inventorySection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  itemCount: {
    backgroundColor: "#E7F2E6",
    borderRadius: 12,
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  emptyInventory: {
    backgroundColor: Design.colors.white,
    borderRadius: 14,
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    padding: 18,
    textAlign: "center",
  },
  inventoryCard: {
    alignItems: "center",
    backgroundColor: Design.colors.white,
    borderColor: "#E8EEE8",
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 8,
    width: "47%",
  },
  itemImage: {
    backgroundColor: "#F1F6EF",
    borderRadius: 12,
    height: 104,
    width: 104,
  },
  itemAction: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 36,
    minWidth: 104,
    paddingHorizontal: 10,
  },
  unequipAction: {
    backgroundColor: "#A84B4B",
  },
  itemActionPressed: {
    opacity: 0.7,
  },
  itemActionText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption,
  },
  equippedIndicator: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderColor: Design.colors.white,
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 12,
    width: 22,
  },
  equippedCheck: {
    color: Design.colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  actionError: {
    backgroundColor: "#FFF1F0",
    borderRadius: 10,
    color: "#A93232",
    fontFamily: FontFamily.beVietnamRegular,
    padding: 12,
  },
});
