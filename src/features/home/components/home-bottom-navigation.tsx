import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Design } from '@/src/constants/design';
import { AnimatedTogglePill } from '@/src/components/home/animated-toggle-pill';
import { styles } from '@/src/features/home/home.styles';
import type { HomeBottomNavigationProps } from '@/src/features/home/types/home-components';

export function HomeBottomNavigation({ isNight, onOpenShop }: HomeBottomNavigationProps) {
  return (
    <View style={styles.bottomBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cửa hàng"
        onPress={onOpenShop}
        style={({ pressed }) => [styles.roundButton, pressed && { transform: [{ scale: 0.93 }] }]}>
        <Ionicons color={Design.colors.white} name="storefront-outline" size={22} />
      </Pressable>
      <AnimatedTogglePill
        activeTab="tasks"
        isNight={isNight}
        onSelectCinema={() => router.push('/cinema')}
        onSelectTasks={() => router.push('/daily-tasks')}
        style={styles.togglePill}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cộng đồng"
        onPress={() => router.push('/community')}
        style={({ pressed }) => [
          styles.roundButton,
          styles.roundButtonOutline,
          pressed && { transform: [{ scale: 0.93 }] },
        ]}>
        <Ionicons color={Design.colors.black} name="globe-outline" size={22} />
      </Pressable>
    </View>
  );
}
