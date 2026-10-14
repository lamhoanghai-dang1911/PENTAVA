import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../settings.styles';
import type { SettingsProfileCardProps } from '../types/settings';

export function SettingsProfileCard({
  profile,
  avatarUrl,
  avatarLoadFailed,
  onAvatarError,
  onOpenSocialProfile,
  isNight,
}: SettingsProfileCardProps & { isNight?: boolean }) {
  const avatarSource = avatarUrl && !avatarLoadFailed
    ? { uri: avatarUrl }
    : require('@/assets/images/default-avatar.png');

  return (
    <View style={[styles.profileCard, isNight && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <Image
        cachePolicy="none"
        onError={onAvatarError}
        source={avatarSource}
        style={styles.avatarImage}
      />
      <Pressable
        accessibilityLabel="Mở trang cá nhân của tôi"
        accessibilityRole="button"
        onPress={onOpenSocialProfile}
        style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.profileName, isNight && { color: '#F8FAFC' }]}>{profile?.name ?? 'Đang tải...'}</Text>
        </View>
        <View style={styles.levelBadge} />
      </Pressable>
    </View>
  );
}
