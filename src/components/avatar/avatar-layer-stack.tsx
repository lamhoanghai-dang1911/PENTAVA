import React from 'react';
import type { AvatarLayer } from '@/src/types/api/skin';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

type AvatarLayerStackProps = {
  layers: AvatarLayer[];
};

const BaseAvatarLayer = React.memo(function BaseAvatarLayer({ layer }: { layer: AvatarLayer }) {
  const [isFocused, setIsFocused] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, []),
  );

  return (
    <LottieView
      autoPlay={isFocused}
      loop={isFocused}
      renderMode="AUTOMATIC"
      speed={1}
      onAnimationFailure={(error) => {
        console.error('Unable to load the avatar Lottie animation.', error);
      }}
      resizeMode="contain"
      source={require('@/assets/avatar/pentava_cat_idle1.json')}
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: layer.layerOrder,
        },
      ]}
      webStyle={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: layer.layerOrder,
      }}
    />
  );
});

const AccessoryAvatarLayer = React.memo(function AccessoryAvatarLayer({ layer }: { layer: AvatarLayer }) {
  return (
    <Image
      cachePolicy="memory-disk"
      contentFit="contain"
      priority="high"
      source={{ uri: layer.imageUrl }}
      transition={150}
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [{ translateY: 0 }],
          zIndex: layer.layerOrder,
        },
      ]}
    />
  );
});

export const AvatarLayerStack = React.memo(function AvatarLayerStack({ layers }: AvatarLayerStackProps) {
  const orderedLayers = React.useMemo(() => {
    return [...layers].sort((left, right) => left.layerOrder - right.layerOrder);
  }, [layers]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {orderedLayers.map((layer) =>
        layer.slot === 'BASE' ? (
          <BaseAvatarLayer key={`${layer.layerOrder}-${layer.code}`} layer={layer} />
        ) : (
          <AccessoryAvatarLayer key={`${layer.layerOrder}-${layer.code}`} layer={layer} />
        ),
      )}
    </View>
  );
});

