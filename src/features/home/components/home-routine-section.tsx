import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Design } from '@/src/constants/design';
import RoutineTodayCard from '@/src/components/home/routinetodaycard';
import { styles } from '@/src/features/home/home.styles';
import type { HomeRoutineSectionProps } from '@/src/features/home/types/home-components';

export function HomeRoutineSection({
  goalId,
  isNight,
  isImmersiveView,
  onExitImmersive,
}: HomeRoutineSectionProps) {
  if (isImmersiveView) {
    return (
      <Pressable
        accessibilityLabel="Chạm để thoát chế độ toàn cảnh"
        accessibilityRole="button"
        onPress={onExitImmersive}
        style={({ pressed }) => [
          styles.immersiveHintPill,
          isNight && styles.immersiveHintPillNight,
          pressed && { opacity: 0.8 },
        ]}>
        <Ionicons color={isNight ? '#93C5FD' : '#15803D'} name="sparkles" size={15} />
        <Text style={[styles.immersiveHintText, isNight && styles.immersiveHintTextNight]}>
          Đang xem toàn cảnh • Chạm để hiện lại menu
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.bottomCardSection}>
      <Pressable
        accessibilityLabel="Kho trang phục"
        accessibilityRole="button"
        onPress={() => router.push('/wardrobe' as any)}
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
      <RoutineTodayCard goalId={goalId} />
    </View>
  );
}
