import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../settings.styles';
import type { SettingsHeaderProps } from '../types/settings';

export function SettingsHeader({ title = 'Hồ sơ của tôi', isNight }: SettingsHeaderProps & { isNight?: boolean }) {
  return (
    <View style={styles.headerRow}>
      <Text style={[styles.headerTitle, isNight && { color: '#F8FAFC' }]}>{title}</Text>
    </View>
  );
}
