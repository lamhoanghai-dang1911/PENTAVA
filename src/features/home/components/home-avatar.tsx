import type { AvatarLayer } from '@/src/types/api/skin';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AvatarLayerStack } from '@/src/components/avatar/avatar-layer-stack';
import { styles } from '../home-screen.styles';

type HomeAvatarProps = {
  avatarLayers: AvatarLayer[] | null;
  isImmersiveView: boolean;
};

export function HomeAvatar({ avatarLayers, isImmersiveView }: HomeAvatarProps) {
  const mascotFloatY = useSharedValue(0);
  const mascotScale = useSharedValue(1);

  useEffect(() => {
    mascotFloatY.value = withRepeat(
      withSequence(
        withTiming(-1.5, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    mascotScale.value = withRepeat(
      withSequence(
        withTiming(1.012, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.0, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [mascotFloatY, mascotScale]);

  const animatedMascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: mascotFloatY.value },
      { scale: mascotScale.value },
    ],
  }));

  return (
    <View style={[styles.mascotCard, isImmersiveView && styles.mascotCardImmersive]}>
      <Animated.View style={animatedMascotStyle}>
        <View accessibilityLabel="Avatar hiện tại" style={styles.mascot}>
          {avatarLayers ? (
            <AvatarLayerStack layers={avatarLayers} />
          ) : (
            <Image
              contentFit="contain"
              source={require('@/assets/images/onboarding/cat-loading.png')}
              style={StyleSheet.absoluteFill}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}
