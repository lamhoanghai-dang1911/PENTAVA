import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { AvatarLayerStack } from '@/src/components/avatar/avatar-layer-stack';
import type { AvatarPreviewProps } from '../types/wardrobe';
import { styles } from '../wardrobe.styles';

function AvatarLayersPreview({ layers }: AvatarPreviewProps) {
  return (
    <View accessibilityLabel="Trang phục avatar hiện tại" style={styles.avatarPreview}>
      {layers.length > 0 ? <AvatarLayerStack layers={layers} /> : null}
      {layers.length === 0 ? (
        <Text style={styles.emptyAvatar}>Chưa có hình ảnh avatar</Text>
      ) : null}
    </View>
  );
}

export function AvatarPreview({ layers }: AvatarPreviewProps) {
  return (
    <View style={styles.previewCard}>
      <View style={styles.previewHeader}>
        <View style={styles.previewBadge}>
          <Ionicons color="#059669" name="sparkles" size={13} />
          <Text style={styles.previewBadgeText}>Avatar hiện tại</Text>
        </View>
        <Text style={styles.previewLayersCount}>
          {layers.length} lớp trang phục
        </Text>
      </View>
      <AvatarLayersPreview layers={layers} />
    </View>
  );
}
