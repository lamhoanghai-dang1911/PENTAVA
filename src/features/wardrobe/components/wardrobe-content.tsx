import { Design } from '@/src/constants/design';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { AvatarPreview } from './avatar-preview';
import { InventoryCard } from './inventory-card';
import type { WardrobeContentProps } from '../types/wardrobe';
import { styles } from '../wardrobe.styles';

export function WardrobeContent({
  avatar,
  inventory,
  sortedInventory,
  isLoading,
  error,
  actionError,
  activeItemId,
  onRefresh,
  onEquip,
  onUnequip,
}: WardrobeContentProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={isLoading}
          tintColor={Design.colors.primaryGreen}
        />
      }
      showsVerticalScrollIndicator={false}>
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          {!avatar ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRefresh}
              style={styles.retryButton}>
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
          <AvatarPreview layers={avatar.layers} />

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
                  isEquipped={avatar.layers.some((layer) => layer.code === item.code)}
                  isBusy={activeItemId === item.id}
                  hasActiveItem={activeItemId !== null}
                  key={item.id}
                  onEquip={() => onEquip(item)}
                  onUnequip={() => onUnequip(item)}
                />
              ))
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
