import { Design } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SLOT_NAMES } from '../constants';
import type { InventoryCardProps } from '../types/wardrobe';
import { styles } from '../wardrobe.styles';

export function InventoryCard({
  item,
  isEquipped,
  isBusy,
  hasActiveItem,
  onEquip,
  onUnequip,
}: InventoryCardProps) {
  const canUnequip = item.slot !== 'BASE';

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
        accessibilityLabel={isEquipped ? 'Gỡ trang phục' : 'Trang bị'}
        accessibilityRole="button"
        disabled={isBusy || hasActiveItem || (isEquipped && !canUnequip)}
        onPress={isEquipped ? onUnequip : onEquip}
        style={({ pressed }) => [
          styles.itemAction,
          isEquipped && (canUnequip ? styles.unequipAction : styles.baseItemAction),
          (pressed || isBusy) && styles.itemActionPressed,
        ]}>
        {isBusy ? (
          <ActivityIndicator color={Design.colors.white} size="small" />
        ) : (
          <Text
            style={[
              styles.itemActionText,
              isEquipped && (canUnequip ? styles.unequipActionText : styles.baseItemActionText),
            ]}>
            {isEquipped
              ? canUnequip
                ? 'Gỡ bỏ'
                : 'Mặc định'
              : 'Mặc ngay ✨'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
