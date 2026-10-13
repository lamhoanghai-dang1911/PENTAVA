import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

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

export function CircularProgress({
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
  const animatedFill = useRef(new Animated.Value(fill)).current;
  const [currentFill, setCurrentFill] = useState(fill);

  useEffect(() => {
    const animation = Animated.timing(animatedFill, {
      toValue: fill,
      duration,
      useNativeDriver: false,
    });

    const listenerId = animatedFill.addListener(({ value }) => {
      setCurrentFill(value);
    });

    animation.start();

    return () => {
      animatedFill.removeListener(listenerId);
      animation.stop();
    };
  }, [fill, duration, animatedFill]);

  const clampedFill = Math.min(100, Math.max(0, currentFill));
  const radius = (size - width) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * clampedFill) / 100;

  // Bắt đầu vẽ từ 12h (-90deg) và hỗ trợ góc xoay tuỳ chọn
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
        <Circle
          cx={cx}
          cy={cy}
          fill="none"
          r={radius}
          stroke={tintColor}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap={lineCap}
          strokeWidth={width}
        />
      </Svg>

      {children ? (
        <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.childrenContainer]}>
          {typeof children === 'function' ? children(currentFill) : children}
        </View>
      ) : null}
    </View>
  );
}

export const AnimatedCircularProgress = CircularProgress;
export default CircularProgress;

const styles = StyleSheet.create({
  childrenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
