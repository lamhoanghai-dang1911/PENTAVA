import { Design } from '@/src/constants/design';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ProgressBarProps = {
  currentStep: number;
};

function ProgressSegment({ width, isActive }: { width: number; isActive: boolean }) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 300 });
  }, [isActive, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [Design.colors.progressInactive, Design.colors.black],
    );
    return {
      backgroundColor,
      transform: [{ scaleY: interpolate(progress.value, [0, 1], [0.92, 1]) }],
    };
  });

  return <Animated.View style={[styles.segment, { width }, animatedStyle]} />;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Design.progress.segmentWidths.map((width, index) => (
        <ProgressSegment
          key={`segment-${index}`}
          isActive={index < currentStep}
          width={width}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  segment: {
    height: 10,
    borderRadius: Design.borderRadius.progress,
  },
  segmentActive: {
    backgroundColor: Design.colors.black,
  },
  segmentInactive: {
    backgroundColor: Design.colors.progressInactive,
  },
});
