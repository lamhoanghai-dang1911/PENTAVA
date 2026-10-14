import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  color?: string;
};

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  color = '#E2E8F0',
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: color,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCircle({
  size = 40,
  style,
  color,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
  color?: string;
}) {
  return (
    <Skeleton
      color={color}
      height={size}
      width={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

export function SkeletonText({
  width = '100%',
  height = 14,
  style,
  color,
}: {
  width?: DimensionValue;
  height?: number;
  style?: StyleProp<ViewStyle>;
  color?: string;
}) {
  return (
    <Skeleton
      color={color}
      height={height}
      width={width}
      borderRadius={height / 2}
      style={style}
    />
  );
}

export function SkeletonCard({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
});
