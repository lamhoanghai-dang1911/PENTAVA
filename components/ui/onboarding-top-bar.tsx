import { Design } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

type OnboardingTopBarProps = {
  currentStep: number;
  showBack?: boolean;
  showForward?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onForward?: () => void;
  onClose?: () => void;
};

export function OnboardingTopBar({
  currentStep,
  showBack = false,
  showForward = false,
  showClose = false,
  onBack,
  onForward,
  onClose,
}: OnboardingTopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {showClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            onPress={onClose}
            style={styles.navButton}>
            <Ionicons color={Design.colors.black} name="close" size={20} />
          </Pressable>
        ) : showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={onBack}
            style={styles.navButton}>
            <Ionicons color={Design.colors.black} name="chevron-back" size={20} />
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}

        {showForward ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tiếp theo"
            onPress={onForward}
            style={styles.navButton}>
            <Ionicons color={Design.colors.black} name="chevron-forward" size={20} />
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
      </View>

      <View style={styles.progressRow}>
        {Array.from({ length: Design.progress.totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index < currentStep && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: Design.borderRadius.navButton,
    borderWidth: 1,
    borderColor: Design.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.colors.white,
  },
  navSpacer: {
    width: 42,
    height: 42,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: Design.borderRadius.progress,
    backgroundColor: Design.colors.progressInactive,
  },
  progressSegmentActive: {
    backgroundColor: Design.colors.black,
  },
});