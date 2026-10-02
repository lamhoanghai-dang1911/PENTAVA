import { Design } from '@/src/constants/design';
import RoutineTodayCard from '@/src/components/home/routinetodaycard';
import type { AvatarLayer } from '@/src/types/api/skin';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { HomeAvatar } from './home-avatar';
import { styles } from '../home-screen.styles';

type HomeSceneContentProps = {
  avatarLayers: AvatarLayer[] | null;
  currentGoalId: number | null;
  isNight: boolean;
  isImmersiveView: boolean;
  onOpenWardrobe: () => void;
  onExitImmersiveView: () => void;
};

export function HomeSceneContent({
  avatarLayers,
  currentGoalId,
  isNight,
  isImmersiveView,
  onOpenWardrobe,
  onExitImmersiveView,
}: HomeSceneContentProps) {
  return (
    <>
      <HomeAvatar
        avatarLayers={avatarLayers}
        isImmersiveView={isImmersiveView}
      />

      {!isImmersiveView ? (
        <View style={styles.bottomCardSection}>
          <Pressable
            accessibilityLabel="Kho trang phục"
            accessibilityRole="button"
            onPress={onOpenWardrobe}
            style={({ pressed }) => [
              styles.wardrobeIconButton,
              isNight && styles.wardrobeIconButtonNight,
              pressed && { transform: [{ scale: 0.9 }], opacity: 0.8 },
            ]}>
            <Ionicons
              color={isNight ? '#34D399' : Design.colors.primaryGreen}
              name="shirt-outline"
              size={22}
            />
          </Pressable>

          <RoutineTodayCard goalId={currentGoalId} isNight={isNight} />
        </View>
      ) : (
        <Pressable
          accessibilityLabel="Chạm để thoát chế độ toàn cảnh"
          onPress={onExitImmersiveView}
          style={({ pressed }) => [
            styles.immersiveHintPill,
            isNight && styles.immersiveHintPillNight,
            pressed && { opacity: 0.8 },
          ]}>
          <Ionicons
            color={isNight ? '#93C5FD' : '#15803D'}
            name="sparkles"
            size={15}
          />
          <Text style={[styles.immersiveHintText, isNight && styles.immersiveHintTextNight]}>
            Đang xem toàn cảnh • Chạm để hiện lại menu
          </Text>
        </Pressable>
      )}
    </>
  );
}
