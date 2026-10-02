import type { AvatarLayer } from '@/src/types/api/skin';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
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
import { styles } from '../home-screen.styles';

function AvatarBaseAnimation({ layer }: { layer: AvatarLayer }) {
  const player = useVideoPlayer(layer.imageUrl, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  return (
    <VideoView
      contentFit="contain"
      player={player}
      style={[
        {
          transform: [{ translateY: layer.slot === 'BASE' ? 0 : -20 }],
          zIndex: layer.layerOrder,
        },
      ]}
      surfaceType="textureView"
    />
  );
}

function AvatarLayerView({ layer }: { layer: AvatarLayer }) {
  if (layer.slot === 'BASE') {
    return <AvatarBaseAnimation layer={layer} />;
  }

  return (
    <Image
      contentFit="contain"
      source={{ uri: layer.imageUrl }}
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [{ translateY: -20 }],
          zIndex: layer.layerOrder,
        },
      ]}
    />
  );
}

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
            avatarLayers.map((layer) => (
              <AvatarLayerView
                key={`${layer.layerOrder}-${layer.code}`}
                layer={layer}
              />
            ))
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
