import type { AvatarLayer } from '@/src/types/api/skin';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

type AvatarLayerStackProps = {
  layers: AvatarLayer[];
};

function BaseAvatarLayer({ layer }: { layer: AvatarLayer }) {
  const player = useVideoPlayer(layer.imageUrl, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  return (
    <VideoView
      contentFit="contain"
      nativeControls={false}
      player={player}
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: layer.layerOrder,
        },
      ]}
      surfaceType="textureView"
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
          transform: [{ translateY: -20 }],
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
