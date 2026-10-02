import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const DAY_BACKGROUND_URL =
  'https://olgtvgfgpaydkopjhern.supabase.co/storage/v1/object/public/background/day_background.png';
const NIGHT_BACKGROUND_URL =
  'https://olgtvgfgpaydkopjhern.supabase.co/storage/v1/object/public/background/night_background.png';

type DayNightBackgroundProps = {
  isNight: boolean;
};

export default function DayNightBackground({ isNight }: DayNightBackgroundProps) {
  const transitionProgress = useSharedValue(isNight ? 1 : 0);

  useEffect(() => {
    transitionProgress.value = withTiming(isNight ? 1 : 0, {
      duration: 700,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [isNight, transitionProgress]);

  const dayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - transitionProgress.value,
  }));

  const nightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: transitionProgress.value,
  }));

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, dayAnimatedStyle]}>
        <Image contentFit="cover" source={{ uri: DAY_BACKGROUND_URL }} style={styles.image} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, nightAnimatedStyle]}>
        <Image contentFit="cover" source={{ uri: NIGHT_BACKGROUND_URL }} style={styles.image} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
