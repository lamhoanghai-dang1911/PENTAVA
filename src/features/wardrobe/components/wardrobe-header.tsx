import { Text, View } from 'react-native';
import type { WardrobeHeaderProps } from '../types/wardrobe';
import { styles } from '../wardrobe.styles';

export function WardrobeHeader({ inventoryCount, isNight }: WardrobeHeaderProps & { isNight?: boolean }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleWrap}>
        <Text style={[styles.headerTitle, isNight && { color: '#F8FAFC' }]}>Kho trang phục</Text>
        <Text style={[styles.headerSubtitle, isNight && { color: '#94A3B8' }]}>Tùy biến phong cách cho linh vật</Text>
      </View>
      <View style={[styles.inventoryCountBadge, isNight && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <Text style={[styles.inventoryCountText, isNight && { color: '#34D399' }]}>🎒 {inventoryCount}</Text>
      </View>
    </View>
  );
}
