import { Text, View } from 'react-native';
import type { WardrobeHeaderProps } from '../types/wardrobe';
import { styles } from '../wardrobe.styles';

export function WardrobeHeader({ inventoryCount, isNight }: WardrobeHeaderProps & { isNight?: boolean }) {
  return (
    <View style={[styles.header, isNight && { backgroundColor: '#0B132B', borderBottomColor: '#1E293B' }]}>
      <View style={styles.headerTitleWrap}>
        <Text style={[styles.headerTitle, isNight && { color: '#F8FAFC' }]}>Kho trang phục</Text>
        <Text style={[styles.headerSubtitle, isNight && { color: '#94A3B8' }]}>Tùy biến phong cách cho linh vật</Text>
      </View>
    </View>
  );
}
