import { Design } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../settings.styles';
import type { SettingsMenuListProps } from '../types/settings';

export function SettingsMenuList({ items, onSelect }: SettingsMenuListProps) {
  return (
    <>
      <View style={styles.menuSectionHeader}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
      </View>
      <View style={styles.menuCard}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            onPress={() => onSelect(item)}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
            <View style={styles.menuLeft}>
              <Ionicons color={Design.colors.black} name={item.icon as any} size={20} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons color={Design.colors.mutedText} name="chevron-forward" size={18} />
          </Pressable>
        ))}
      </View>
    </>
  );
}
