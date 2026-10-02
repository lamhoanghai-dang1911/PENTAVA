import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import type { WardrobeHeaderProps } from '../types/wardrobe';
import { styles } from '../wardrobe.styles';

export function WardrobeHeader({ inventoryCount, onBack }: WardrobeHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Quay lại"
        accessibilityRole="button"
        hitSlop={10}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons color="#1E293B" name="chevron-back" size={24} />
      </Pressable>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle}>Kho trang phục</Text>
        <Text style={styles.headerSubtitle}>Tùy biến phong cách cho linh vật</Text>
      </View>
      <View style={styles.inventoryCountBadge}>
        <Text style={styles.inventoryCountText}>🎒 {inventoryCount}</Text>
      </View>
    </View>
  );
}
