import { Design } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../settings.styles';
import type { SettingsHeaderProps } from '../types/settings';

export function SettingsHeader({ title = 'Hồ sơ của tôi', onBack }: SettingsHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Ionicons color={Design.colors.primaryGreen} name="chevron-back" size={24} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}
