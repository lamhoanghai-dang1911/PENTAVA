import { Design, FontFamily } from '@/src/constants/design';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { SelectionIndicator } from './selection-indicator';

type SelectionCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectionCard({ label, selected, onPress }: SelectionCardProps) {
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      bounciness: 4,
      speed: 18,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 4,
      speed: 18,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          selected && styles.cardSelected,
        ]}>
        <Text style={styles.label}>{label}</Text>
        <SelectionIndicator selected={selected} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 60,
    borderRadius: Design.borderRadius.input,
    borderWidth: 1,
    borderColor: Design.colors.optionBorder,
    backgroundColor: Design.colors.white,
    paddingHorizontal: 28,
    paddingVertical: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: Design.colors.primaryGreen,
    borderWidth: 1.5,
  },
  cardPressed: {
    opacity: 0.9,
  },
  label: {
    flex: 1,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.body,
    color: Design.colors.black,
  },
});
