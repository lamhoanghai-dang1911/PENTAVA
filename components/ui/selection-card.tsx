import { Design, FontFamily } from '@/constants/design';
import { Pressable, StyleSheet, Text } from 'react-native';

import { SelectionIndicator } from './selection-indicator';

type SelectionCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectionCard({ label, selected, onPress }: SelectionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}>
      <Text style={styles.label}>{label}</Text>
      <SelectionIndicator selected={selected} />
    </Pressable>
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
