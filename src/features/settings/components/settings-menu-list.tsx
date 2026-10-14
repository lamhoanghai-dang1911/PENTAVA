import { Design } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../settings.styles';
import type { SettingsMenuListProps } from '../types/settings';

export function SettingsMenuList({ items, onSelect, isNight }: SettingsMenuListProps & { isNight?: boolean }) {
  return (
    <>
      <View style={styles.menuSectionHeader}>
        <Text style={[styles.sectionTitle, isNight && { color: '#94A3B8' }]}>Cài đặt</Text>
      </View>
      <View style={[styles.menuCard, isNight && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        {items.map((item, index) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            onPress={() => onSelect(item)}
            style={({ pressed }) => [
              styles.menuItem,
              isNight && { borderBottomColor: '#334155' },
              index === items.length - 1 && { borderBottomWidth: 0 },
              pressed && styles.menuItemPressed,
            ]}>
            <View style={styles.menuLeft}>
              <Ionicons color={isNight ? '#34D399' : Design.colors.black} name={item.icon as any} size={20} />
              <Text style={[styles.menuLabel, isNight && { color: '#F8FAFC' }]}>{item.label}</Text>
            </View>
            <Ionicons color={isNight ? '#64748B' : Design.colors.mutedText} name="chevron-forward" size={18} />
          </Pressable>
        ))}
      </View>
    </>
  );
}
