import { styles } from '@/src/features/home/home.styles';
import type { HomeAvatarStageProps } from '@/src/features/home/types/home-components';
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

export function HomeAvatarStage({ avatarLayers, isImmersiveView }: HomeAvatarStageProps) {
  const mascotFloatY = useSharedValue(0);
  const mascotScale = useSharedValue(1);

  useEffect(() => {
    mascotFloatY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    mascotScale.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
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
            avatarLayers.map((layer) => (
              <Image
                key={`${layer.layerOrder}-${layer.code}`}
                contentFit="contain"
                source={{ uri: layer.imageUrl }}
                style={[
                  StyleSheet.absoluteFill,
                  {
                    transform: [{ translateY: layer.slot === 'BASE' ? 0 : -19 }],
                    zIndex: layer.layerOrder,
                  },
                ]}
              />
            ))
          ) : (
            <Image
              contentFit="contain"
              source={require('@/assets/images/onboarding/cat-loading.png')}
              style={[StyleSheet.absoluteFill]}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}
