import { useMemo } from 'react';
import { Design } from '@/src/constants/design';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { AvatarPreview } from './avatar-preview';
import { InventoryCard } from './inventory-card';
import { WardrobeSkeleton } from './wardrobe-skeleton';
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
  isNight,
}: WardrobeContentProps) {
  const equippedCodes = useMemo(
    () => new Set(avatar?.layers.map((l) => l.code) ?? []),
    [avatar?.layers],
  );

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
        <WardrobeSkeleton />
      ) : avatar ? (
        <>
          <AvatarPreview isNight={isNight} layers={avatar.layers} />

          <View style={styles.inventorySection}>
            {actionError ? (
              <Text accessibilityRole="alert" style={styles.actionError}>
                {actionError}
              </Text>
            ) : null}
            {inventory.length === 0 ? (
              <Text style={[styles.emptyInventory, isNight && { backgroundColor: '#111C44', borderColor: '#1E293B', color: '#94A3B8' }]}>
                Kho đồ của bạn đang trống. Hãy ghé Cửa hàng nhé!
              </Text>
            ) : (
              sortedInventory.map((item) => (
                <InventoryCard
                  hasActiveItem={activeItemId !== null}
                  isBusy={activeItemId === item.id}
                  isEquipped={equippedCodes.has(item.code)}
                  isNight={isNight}
                  item={item}
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
