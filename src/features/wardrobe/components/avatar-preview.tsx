import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { AvatarLayerStack } from '@/src/components/avatar/avatar-layer-stack';
import type { AvatarPreviewProps } from '../types/wardrobe';
import { styles } from '../wardrobe.styles';

export function AvatarPreview({ layers, isNight }: AvatarPreviewProps) {
  return (
    <View style={[styles.previewCard, isNight && { backgroundColor: '#111C44', borderColor: '#1E293B', shadowColor: '#000000' }]}>
      <View style={styles.previewHeader}>
        <View style={[styles.previewBadge, isNight && { backgroundColor: '#132A22', borderColor: '#065F46' }]}>
          <Ionicons color="#059669" name="sparkles" size={13} />
          <Text style={[styles.previewBadgeText, isNight && { color: '#34D399' }]}>Avatar hiện tại</Text>
        </View>
        <Text style={[styles.previewLayersCount, isNight && { color: '#94A3B8' }]}>
          {layers.length} lớp trang phục
        </Text>
      </View>
      <View accessibilityLabel="Trang phục avatar hiện tại" style={[styles.avatarPreview, isNight && { backgroundColor: '#0B132B', borderColor: '#1E293B' }]}>
        {layers.length > 0 ? <AvatarLayerStack layers={layers} /> : null}
        {layers.length === 0 ? (
          <Text style={styles.emptyAvatar}>Chưa có hình ảnh avatar</Text>
        ) : null}
      </View>
    </View>
  );
}
