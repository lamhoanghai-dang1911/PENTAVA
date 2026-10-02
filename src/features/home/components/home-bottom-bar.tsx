import { AnimatedTogglePill } from '@/src/components/home/animated-toggle-pill';
import { Design } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { styles } from '../home-screen.styles';

type HomeBottomBarProps = {
  toggleKey: number;
  isNight: boolean;
  onOpenShop: () => void;
  onOpenCinema: () => void;
  onOpenTasks: () => void;
  onOpenCommunity: () => void;
};

export function HomeBottomBar({
  toggleKey,
  isNight,
  onOpenShop,
  onOpenCinema,
  onOpenTasks,
  onOpenCommunity,
}: HomeBottomBarProps) {
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
        key={toggleKey}
        activeTab="tasks"
        isNight={isNight}
        onSelectCinema={onOpenCinema}
        onSelectTasks={onOpenTasks}
        style={styles.togglePill}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cộng đồng"
        onPress={onOpenCommunity}
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
