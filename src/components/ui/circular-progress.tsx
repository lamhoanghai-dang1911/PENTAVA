import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type CircularProgressProps = {
  size: number;
  width: number;
  fill: number;
  tintColor: string;
  backgroundColor?: string;
  duration?: number;
  lineCap?: 'round' | 'butt' | 'square';
  rotation?: number;
  children?: ((fill: number) => React.ReactNode) | React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const CircularProgress = React.memo(function CircularProgress({
  size,
  width,
  fill,
  tintColor,
  backgroundColor,
  duration = 650,
  lineCap = 'round',
  rotation = 0,
  children,
  style,
}: CircularProgressProps) {
  const animatedFill = useSharedValue(fill);

  useEffect(() => {
    animatedFill.value = withTiming(fill, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [fill, duration, animatedFill]);

  const radius = (size - width) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedCircleProps = useAnimatedProps(() => {
    const clampedFill = Math.min(100, Math.max(0, animatedFill.value));
    const strokeDashoffset = circumference - (circumference * clampedFill) / 100;
    return {
      strokeDashoffset,
    };
  });

  const svgRotation = -90 + rotation;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg
        height={size}
        style={{ transform: [{ rotate: `${svgRotation}deg` }] }}
        width={size}
      >
        {backgroundColor ? (
          <Circle
            cx={cx}
            cy={cy}
            fill="none"
            r={radius}
            stroke={backgroundColor}
            strokeWidth={width}
          />
        ) : null}
        <AnimatedCircle
          animatedProps={animatedCircleProps}
          cx={cx}
          cy={cy}
          fill="none"
          r={radius}
          stroke={tintColor}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap={lineCap}
          strokeWidth={width}
        />
      </Svg>

      {children ? (
        <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.childrenContainer]}>
          {typeof children === 'function' ? children(fill) : children}
        </View>
      ) : null}
    </View>
  );
});

export const AnimatedCircularProgress = CircularProgress;
export default CircularProgress;

const styles = StyleSheet.create({
  childrenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
