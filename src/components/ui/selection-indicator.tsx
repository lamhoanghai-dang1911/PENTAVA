import { Design } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

type SelectionIndicatorProps = {
  selected: boolean;
};

export function SelectionIndicator({ selected }: SelectionIndicatorProps) {
  if (selected) {
    return (
      <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.selectedCircle}>
        <Ionicons color={Design.colors.white} name="checkmark" size={12} />
      </Animated.View>
    );
  }

  return (
    <Image
      source={require('@/assets/images/onboarding/check-circle.png')}
      style={styles.unselectedIcon}
    />
  );
}

const styles = StyleSheet.create({
  unselectedIcon: {
    width: 19,
    height: 19,
  },
  selectedCircle: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: Design.colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
