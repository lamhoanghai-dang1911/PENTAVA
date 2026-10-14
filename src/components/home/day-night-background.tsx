import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const DAY_BACKGROUND = require('@/assets/images/home/day_background.png');
const NIGHT_BACKGROUND = require('@/assets/images/home/night_background.png');

type DayNightBackgroundProps = {
  isNight: boolean;
};

export const DayNightBackground = React.memo(function DayNightBackground({ isNight }: DayNightBackgroundProps) {
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
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          source={DAY_BACKGROUND}
          style={styles.image}
        />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, nightAnimatedStyle]}>
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          source={NIGHT_BACKGROUND}
          style={styles.image}
        />
      </Animated.View>
    </View>
  );
});

export default DayNightBackground;

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
