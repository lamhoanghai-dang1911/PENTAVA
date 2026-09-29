import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { skinService } from '@/src/services/skinService';
import type { AvatarLayer } from '@/src/types/api/skin';

export function useHomeAvatar() {
  const [avatarLayers, setAvatarLayers] = useState<AvatarLayer[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;

      void skinService
        .getMyAvatar()
        .then((avatar) => {
          if (isFocused) {
            setAvatarLayers(
              [...avatar.layers].sort(
                (left, right) => left.layerOrder - right.layerOrder,
              ),
            );
          }
        })
        .catch((error: unknown) => {
          if (isFocused) {
            Alert.alert(
              'Không thể tải trang phục avatar',
              error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
            );
          }
        });

      return () => {
        isFocused = false;
      };
    }, []),
  );

  return avatarLayers;
}
