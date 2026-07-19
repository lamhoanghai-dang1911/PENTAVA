import { Design } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';

type SelectionIndicatorProps = {
  selected: boolean;
};

export function SelectionIndicator({ selected }: SelectionIndicatorProps) {
  if (selected) {
    return (
      <View style={styles.selectedCircle}>
        <Ionicons color={Design.colors.white} name="checkmark" size={12} />
      </View>
    );
  }

  return (
    <Image
      source={require('@/assets/images/onboarding/check-circle.png')}
      style={styles.unselectedIcon}
    />
  );
}

const styles = StyleSheet.create({
  unselectedIcon: {
    width: 19,
    height: 19,
  },
  selectedCircle: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: Design.colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
