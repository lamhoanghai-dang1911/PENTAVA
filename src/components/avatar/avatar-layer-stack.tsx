import type { AvatarLayer } from '@/src/types/api/skin';
import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

type AvatarLayerStackProps = {
  layers: AvatarLayer[];
};

function BaseAvatarLayer({ layer }: { layer: AvatarLayer }) {
  return (
    <LottieView
      autoPlay
      loop
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
}

function AccessoryAvatarLayer({ layer }: { layer: AvatarLayer }) {
  return (
    <Image
      contentFit="contain"
      source={{ uri: layer.imageUrl }}
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [{ translateY: 0 }],
          zIndex: layer.layerOrder,
        },
      ]}
    />
  );
}

export function AvatarLayerStack({ layers }: AvatarLayerStackProps) {
  const orderedLayers = [...layers].sort(
    (left, right) => left.layerOrder - right.layerOrder,
  );

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
}
