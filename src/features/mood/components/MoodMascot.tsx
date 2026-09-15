import { StyleSheet, View } from 'react-native';
import Animated, {
  type SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { MOOD_OPTIONS } from '@/src/features/mood/hooks/useMoodSelector';

type MoodMascotProps = {
  progress: SharedValue<number>;
  currentIndex: number;
};

export function MoodMascot({ progress, currentIndex }: MoodMascotProps) {
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(progress.value, [0, 1, 2], [MOOD_OPTIONS[0].color, MOOD_OPTIONS[1].color, MOOD_OPTIONS[2].color]);
    return { backgroundColor };
  });

  const animatedEyeStyle = useAnimatedStyle(() => {
    return { transform: [{ scaleY: interpolate(progress.value, [0, 1, 2], [1, 1, 1]) }] };
  });

  const animatedLeftBrow = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1, 2], [-15, 0, 0]);
    const translateY = interpolate(progress.value, [0, 1, 2], [5, 0, 0]);
    return { transform: [{ rotate: `${rotate}deg` }, { translateY }] };
  });

  const animatedRightBrow = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1, 2], [15, 0, 0]);
    const translateY = interpolate(progress.value, [0, 1, 2], [5, 0, 0]);
    return { transform: [{ rotate: `${rotate}deg` }, { translateY }] };
  });

  const animatedMouthStyle = useAnimatedStyle(() => {
    const height = interpolate(progress.value, [0, 1, 2], [45, 8, 30]);
    const widthMouth = interpolate(progress.value, [0, 1, 2], [45, 45, 45]);
    const borderRadius = interpolate(progress.value, [0, 1, 2], [22, 4, 0]);

    return {
      height,
      width: widthMouth,
      borderRadius,
      borderBottomLeftRadius: interpolate(progress.value, [0, 1, 2], [22, 4, 25]),
      borderBottomRightRadius: interpolate(progress.value, [0, 1, 2], [22, 4, 25]),
      borderTopLeftRadius: interpolate(progress.value, [0, 1, 2], [22, 4, 5]),
      borderTopRightRadius: interpolate(progress.value, [0, 1, 2], [22, 4, 5]),
    };
  });

  return (
    <Animated.View style={[styles.mascotContainer, animatedBackgroundStyle]}>
      <View style={styles.row}>
        <Animated.View style={[styles.eyebrow, animatedLeftBrow]} />
        <Animated.View style={[styles.eyebrow, animatedRightBrow]} />
      </View>

      <View style={[styles.row, styles.eyeRow]}>
        <Animated.View style={[styles.eye, animatedEyeStyle]} />
        <Animated.View style={[styles.eye, animatedEyeStyle]} />
      </View>

      <View style={styles.mouthWrapper}>
        <Animated.View style={[styles.mouth, animatedMouthStyle]} />
      </View>


    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mascotContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 28,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
  },
  eyeRow: {
    marginTop: 15,
  },
  eyebrow: {
    width: 50,
    height: 6,
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  eye: {
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    borderRadius: 16,
  },
  mouthWrapper: {
    marginTop: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mouth: {
    backgroundColor: '#FFF',
  },
  currentMoodDot: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentMoodInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
